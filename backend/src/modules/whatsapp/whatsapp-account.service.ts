import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';

import { WhatsAppAccount } from '../../database/entities/whatsapp-account.entity';
import { ConnectWhatsappAccountDto, EmbeddedSignupDto } from './dto/whatsapp-account.dto';
import {
  assertWhatsappCredentials,
  validateWhatsappApiVersion,
  WhatsappProviderRegistry,
} from './whatsapp-provider';
import type { WhatsappCredentials } from './whatsapp-provider';
import { WhatsappBroadcastRecoveryService } from './whatsapp-broadcast-recovery.service';

/** Internal credential contract for the existing sender. Never expose through HTTP. */
export interface WhatsappAccountCredentials extends WhatsappCredentials {
  accountId: string;
  apiVersion: string;
}

export type RemoteUnsubscribeResult =
  | 'UNSUBSCRIBED'
  | 'SKIPPED_SHARED_WABA'
  | 'SKIPPED_NO_CREDENTIALS'
  | 'FAILED';

const KEY_ID = /^[A-Za-z0-9_-]{1,32}$/;

/** No JWT/app secret derivation and no development fallback. Explicit 32-byte key only.
 * Accept 64 hex characters or canonical base64 encoding of exactly 32 bytes. */
function parseKey(configured: unknown): Buffer | undefined {
  if (typeof configured !== 'string') return undefined;
  if (/^[0-9a-fA-F]{64}$/.test(configured)) return Buffer.from(configured, 'hex');
  if (/^[A-Za-z0-9+/]{43}=$/.test(configured)) {
    const decoded = Buffer.from(configured, 'base64');
    if (decoded.length === 32 && decoded.toString('base64') === configured) return decoded;
  }
  return undefined;
}

@Injectable()
export class WhatsappAccountService {
  private readonly logger = new Logger(WhatsappAccountService.name);
  /** Key id -> key. The id is the first segment of every stored token envelope. */
  private readonly keys = new Map<string, Buffer>();
  private readonly currentKeyId: string;
  private readonly apiVersion: string;

  constructor(
    @InjectRepository(WhatsAppAccount) private readonly accounts: Repository<WhatsAppAccount>,
    private readonly providers: WhatsappProviderRegistry,
    config: ConfigService,
    @Optional() @Inject(WhatsappBroadcastRecoveryService)
    private readonly broadcastRecovery?: WhatsappBroadcastRecoveryService,
  ) {
    // Legacy single key is key id `v1` (every token stored before keyrings existed).
    const legacy = parseKey(config.get<string>('WHATSAPP_ENCRYPTION_KEY'));
    if (legacy) this.keys.set('v1', legacy);
    // WHATSAPP_TOKEN_KEYS="v2:<hex|base64>,v3:<hex|base64>"; keep old ids until re-encrypted.
    for (const entry of (config.get<string>('WHATSAPP_TOKEN_KEYS') ?? '').split(',')) {
      const trimmed = entry.trim();
      if (!trimmed) continue;
      const separator = trimmed.indexOf(':');
      const id = trimmed.slice(0, separator);
      const key = parseKey(trimmed.slice(separator + 1));
      if (separator > 0 && KEY_ID.test(id) && key) this.keys.set(id, key);
      else this.logger.warn('Ignoring an invalid WHATSAPP_TOKEN_KEYS entry');
    }
    // WhatsApp is optional: an absent/invalid key must not prevent CRM startup.
    // Operations requiring token encryption/decryption enforce configuration lazily.
    this.currentKeyId = config.get<string>('WHATSAPP_TOKEN_KEY_ID') || 'v1';
    this.apiVersion = validateWhatsappApiVersion(
      config.get<string>('WHATSAPP_API_VERSION') ?? 'v23.0',
    );
  }

  async list(tenantId: string) {
    this.assertTenant(tenantId);
    const accounts = await this.accounts.find({
      where: { tenantId },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    return accounts.map((account) => this.publicAccount(account));
  }

  /** Embedded Signup: exchange the single-use code, then the same validated connect path. */
  async embeddedSignup(tenantId: string, dto: EmbeddedSignupDto) {
    this.assertTenant(tenantId);
    this.requireEncryptionKey(); // Do not burn the single-use code when we cannot store the token.
    const accessToken = await this.providers.get('meta').exchangeSignupCode(dto.code);
    return this.connect(
      tenantId,
      {
        provider: 'meta',
        phoneNumberId: dto.phoneNumberId,
        businessAccountId: dto.businessAccountId,
        accessToken,
      },
      dto.pin,
    );
  }

  async connect(tenantId: string, dto: ConnectWhatsappAccountDto, pin?: string) {
    this.assertTenant(tenantId);
    this.requireEncryptionKey(); // Fail before any provider GET when unconfigured.
    const credentials: WhatsappCredentials = {
      provider: dto.provider ?? 'meta',
      phoneNumberId: dto.phoneNumberId,
      businessAccountId: dto.businessAccountId,
      accessToken: dto.accessToken,
    };
    assertWhatsappCredentials(credentials);
    const phone = await this.providers.get(credentials.provider).validateCredentials(credentials);
    const encryptedAccessToken = this.encrypt(
      credentials.accessToken,
      tenantId,
      credentials.phoneNumberId,
      credentials.businessAccountId,
    );
    let saved: WhatsAppAccount;
    try {
      // Serialize updates to an existing reservation. New reservations are protected by
      // the unconditional unique index, including concurrent connects by other tenants.
      saved = await this.accounts.manager.transaction(async (manager) => {
        const repository = manager.getRepository(WhatsAppAccount);
        // WABA-scoped template webhooks have no tenant identifier. Keep a WABA's
        // account records under one tenant so those status updates remain isolated.
        await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
          `whatsapp-waba-owner:${credentials.businessAccountId}`,
        ]);
        const otherTenant = await repository
          .createQueryBuilder('account')
          .withDeleted()
          .where('account.businessAccountId = :businessAccountId', {
            businessAccountId: credentials.businessAccountId,
          })
          .andWhere('account.tenantId <> :tenantId', { tenantId })
          .getOne();
        if (otherTenant)
          throw new ConflictException('This WhatsApp business account is already reserved');
        const existing = await repository
          .createQueryBuilder('account')
          .withDeleted()
          .where('account.phoneNumberId = :phone', { phone: credentials.phoneNumberId })
          .setLock('pessimistic_write')
          .getOne();
        if (existing && existing.tenantId !== tenantId) {
          throw new ConflictException('This provider phone ID is already reserved');
        }
        if (existing?.deletedAt) {
          throw new ConflictException(
            'This provider phone ID is archived and requires administrative recovery',
          );
        }
        const account = existing ?? repository.create({ tenantId });
        Object.assign(account, {
          provider: credentials.provider,
          phoneNumberId: credentials.phoneNumberId,
          businessAccountId: credentials.businessAccountId,
          displayPhoneNumber: phone.displayPhoneNumber,
          verifiedName: phone.verifiedName,
          qualityRating: phone.qualityRating,
          status: 'CONNECTED',
          encryptedAccessToken,
          validatedAt: new Date(),
          disconnectedAt: null,
        });
        return repository.save(account);
      });
    } catch (error: unknown) {
      if (error instanceof ConflictException) throw error;
      // QueryFailedError can contain ciphertext/parameters: never propagate or log it.
      const code = (error as { driverError?: { code?: string } } | null)?.driverError?.code;
      if (code === '23505') {
        throw new ConflictException(
          'This provider phone ID is already reserved; retry to reconnect your own account',
        );
      }
      throw new ServiceUnavailableException('Unable to persist the WhatsApp account');
    }
    // The token is stored first: an Embedded Signup code is single-use, so a remote setup
    // failure must not lose it. Failures are returned as warnings and persisted.
    const setupWarnings = await this.setupRemote(saved, credentials, pin);
    await this.broadcastRecovery?.resumeAfterCredentialReconnect(
      tenantId,
      credentials.phoneNumberId,
    );
    return { ...this.publicAccount(saved), setupWarnings };
  }

  /** Re-encrypts every stored token (all tenants, incl. archived) with the current key.
   * Rows changed concurrently are skipped by the compare-and-set update. */
  async reEncryptAllTokens(): Promise<{ reencrypted: number; failed: number }> {
    const { id: currentKeyId } = this.requireEncryptionKey();
    let reencrypted = 0;
    let failed = 0;
    let lastId: string | undefined;
    for (;;) {
      const query = this.accounts
        .createQueryBuilder('account')
        .withDeleted()
        .addSelect('account.encryptedAccessToken')
        .where('account.encryptedAccessToken IS NOT NULL');
      if (lastId) query.andWhere('account.id > :lastId', { lastId });
      const batch = await query.orderBy('account.id', 'ASC').take(100).getMany();
      if (!batch.length) break;
      for (const account of batch) {
        const previous = account.encryptedAccessToken;
        if (!previous || previous.startsWith(`${currentKeyId}.`)) continue;
        try {
          const next = this.encrypt(
            this.decrypt(account),
            account.tenantId,
            account.phoneNumberId,
            account.businessAccountId,
          );
          const result = await this.accounts.update(
            { id: account.id, encryptedAccessToken: previous },
            { encryptedAccessToken: next },
          );
          if (result.affected) reencrypted += 1;
        } catch {
          failed += 1;
        }
      }
      lastId = batch[batch.length - 1].id;
    }
    return { reencrypted, failed };
  }

  /**
   * Only connected rows of this tenant may supply credentials. Multiple phones require
   * an explicit provider phone ID. No ConfigOrchestrator/platform/env credential fallback.
   * Legacy tenant settings must be explicitly validated through connect before use.
   */
  async getCredentials(
    tenantId: string,
    requestedPhoneNumberId?: string,
  ): Promise<WhatsappAccountCredentials> {
    this.assertTenant(tenantId);
    if (
      requestedPhoneNumberId !== undefined &&
      !/^[1-9][0-9]{0,63}$/.test(requestedPhoneNumberId)
    ) {
      throw new BadRequestException('Invalid provider phone number ID');
    }
    const query = this.accounts
      .createQueryBuilder('account')
      .addSelect('account.encryptedAccessToken')
      .where('account.tenantId = :tenantId', { tenantId })
      .andWhere('account.status = :status', { status: 'CONNECTED' });
    if (requestedPhoneNumberId !== undefined) {
      query.andWhere('account.phoneNumberId = :phone', { phone: requestedPhoneNumberId });
    }
    const matches = await query.orderBy('account.id', 'ASC').take(2).getMany();
    if (!matches.length)
      throw new NotFoundException('No connected WhatsApp account found for this tenant');
    if (matches.length > 1)
      throw new BadRequestException(
        'Choose a phoneNumberId when multiple WhatsApp accounts are connected',
      );
    return this.credentialsFor(matches[0]);
  }

  /** Verified webhook routing only. Unknown/disconnected/archived phones fail closed. */
  async findTenantByPhoneNumberId(phoneNumberId: string): Promise<string | null> {
    if (typeof phoneNumberId !== 'string' || !/^[1-9][0-9]{0,63}$/.test(phoneNumberId)) return null;
    const account = await this.accounts.findOne({
      where: { phoneNumberId, status: 'CONNECTED' },
      select: { tenantId: true },
    });
    return account?.tenantId ?? null;
  }

  /** WABA status webhooks omit a phone ID; ambiguous ownership must fail closed. */
  async findTenantByBusinessAccountId(businessAccountId: string): Promise<string | null> {
    if (typeof businessAccountId !== 'string' || !/^[1-9][0-9]{0,63}$/.test(businessAccountId))
      return null;
    const tenants = await this.accounts
      .createQueryBuilder('account')
      .select('account.tenantId', 'tenantId')
      .distinct(true)
      .where('account.businessAccountId = :businessAccountId', { businessAccountId })
      .andWhere('account.status = :status', { status: 'CONNECTED' })
      .take(2)
      .getRawMany<{ tenantId: string }>();
    return tenants.length === 1 ? tenants[0].tenantId : null;
  }

  async health(tenantId: string, id: string) {
    const account = await this.tenantAccount(tenantId, id, true);
    const checkedAt = new Date();
    if (account.status === 'DISCONNECTED') {
      return { accountId: account.id, status: account.status, healthy: false, checkedAt };
    }
    // Credentials are never present in the health response. Meta GETs only.
    try {
      const diagnostics = await this.providers
        .get(account.provider)
        .readHealth(this.credentialsFor(account));
      await this.patch(account, {
        qualityRating: diagnostics.qualityRating,
        // null = not returned this time; keep the last known (possibly webhook-pushed) value.
        messagingLimitTier: diagnostics.messagingLimitTier ?? account.messagingLimitTier,
        nameStatus: diagnostics.nameStatus ?? account.nameStatus,
        webhookSubscribed: diagnostics.webhookSubscribed,
        lastHealthCheckAt: checkedAt,
        lastHealthError: null,
      });
      return {
        accountId: account.id,
        status: account.status,
        credentialsValid: true,
        // Read access does not prove send readiness or billing/permission eligibility.
        healthy:
          diagnostics.codeVerificationStatus === 'VERIFIED' &&
          diagnostics.qualityRating !== 'RED' &&
          diagnostics.qualityRating !== 'UNKNOWN' &&
          diagnostics.webhookSubscribed !== false,
        checkedAt,
        error: null,
        ...diagnostics,
      };
    } catch (error: unknown) {
      const message = this.safeMessage(error);
      await this.patch(account, { lastHealthCheckAt: checkedAt, lastHealthError: message });
      return {
        accountId: account.id,
        status: account.status,
        // 400s mean Meta rejected the token/ownership; anything else is inconclusive.
        credentialsValid: error instanceof BadRequestException ? false : null,
        healthy: false,
        checkedAt,
        error: message,
      };
    }
  }

  async disconnect(tenantId: string, id: string) {
    const current = await this.tenantAccount(tenantId, id, true);
    let credentials: WhatsappAccountCredentials | null = null;
    try {
      credentials = current.status === 'CONNECTED' ? this.credentialsFor(current) : null;
    } catch {
      credentials = null; // Undecryptable token: still wipe locally.
    }
    let account: WhatsAppAccount;
    try {
      account = await this.accounts.manager.transaction(async (manager) => {
        const repository = manager.getRepository(WhatsAppAccount);
        const existing = await repository
          .createQueryBuilder('account')
          .where('account.tenantId = :tenantId AND account.id = :id', { tenantId, id })
          .setLock('pessimistic_write')
          .getOne();
        if (!existing) throw new NotFoundException('WhatsApp account not found');
        existing.status = 'DISCONNECTED';
        existing.encryptedAccessToken = null;
        existing.disconnectedAt ??= new Date();
        return repository.save(existing);
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException('Unable to disconnect the WhatsApp account');
    }
    const remoteUnsubscribe = await this.unsubscribeRemote(account, credentials);
    return { ...this.publicAccount(account), remoteUnsubscribe };
  }

  /** Best-effort; never fails the (already committed) local disconnect. */
  private async unsubscribeRemote(
    account: WhatsAppAccount,
    credentials: WhatsappAccountCredentials | null,
  ): Promise<RemoteUnsubscribeResult> {
    if (!credentials) return 'SKIPPED_NO_CREDENTIALS';
    try {
      // The subscription is per app+WABA: keep it while any connected number (any tenant)
      // still uses this WABA. ponytail: racy if two last numbers disconnect concurrently
      // (both skip); a later health check shows webhook_subscribed.
      const sharing = await this.accounts.count({
        where: { businessAccountId: credentials.businessAccountId, status: 'CONNECTED' },
      });
      if (sharing > 0) return 'SKIPPED_SHARED_WABA';
      await this.providers.get(credentials.provider).unsubscribeApp(credentials);
      await this.patch(account, { webhookSubscribed: false, lastHealthError: null });
      return 'UNSUBSCRIBED';
    } catch (error: unknown) {
      await this.patch(account, {
        lastHealthError: `Meta app unsubscribe failed on disconnect: ${this.safeMessage(error)}`,
      });
      return 'FAILED';
    }
  }

  private async setupRemote(
    account: WhatsAppAccount,
    credentials: WhatsappCredentials,
    pin?: string,
  ): Promise<string[]> {
    const provider = this.providers.get(credentials.provider);
    const warnings: string[] = [];
    let webhookSubscribed: boolean | null = null;
    try {
      await provider.subscribeApp(credentials);
      webhookSubscribed = true;
    } catch (error: unknown) {
      warnings.push(`Webhook subscription failed: ${this.safeMessage(error)}`);
    }
    if (pin !== undefined) {
      try {
        await provider.registerPhone(credentials, pin);
      } catch (error: unknown) {
        warnings.push(`Phone registration failed: ${this.safeMessage(error)}`);
      }
    }
    await this.patch(account, {
      webhookSubscribed,
      lastHealthError: warnings.length ? warnings.join('; ') : null,
    });
    return warnings;
  }

  /** Best-effort status write; mutates the in-memory row so responses reflect it. */
  private async patch(
    account: WhatsAppAccount,
    values: Partial<
      Pick<
        WhatsAppAccount,
        | 'qualityRating'
        | 'messagingLimitTier'
        | 'nameStatus'
        | 'webhookSubscribed'
        | 'lastHealthCheckAt'
        | 'lastHealthError'
      >
    >,
  ): Promise<void> {
    if (typeof values.lastHealthError === 'string') {
      values.lastHealthError = values.lastHealthError.slice(0, 500);
    }
    Object.assign(account, values);
    try {
      await this.accounts.update({ id: account.id, tenantId: account.tenantId }, values);
    } catch {
      this.logger.warn('Unable to persist WhatsApp account status');
    }
  }

  /** Only our own sanitized HttpException messages; never provider bodies or Axios errors. */
  private safeMessage(error: unknown): string {
    return error instanceof HttpException ? error.message.slice(0, 200) : 'Unexpected error';
  }

  private async tenantAccount(
    tenantId: string,
    id: string,
    includeToken: boolean,
  ): Promise<WhatsAppAccount> {
    this.assertTenant(tenantId);
    this.assertAccountId(id);
    const query = this.accounts
      .createQueryBuilder('account')
      .where('account.tenantId = :tenantId AND account.id = :id', { tenantId, id });
    if (includeToken) query.addSelect('account.encryptedAccessToken');
    const account = await query.getOne();
    if (!account) throw new NotFoundException('WhatsApp account not found');
    return account;
  }

  private credentialsFor(account: WhatsAppAccount): WhatsappAccountCredentials {
    if (account.status !== 'CONNECTED' || !account.encryptedAccessToken) {
      throw new BadRequestException('WhatsApp account is disconnected');
    }
    const credentials = {
      accountId: account.id,
      provider: account.provider,
      phoneNumberId: account.phoneNumberId,
      businessAccountId: account.businessAccountId,
      accessToken: this.decrypt(account),
      apiVersion: validateWhatsappApiVersion(this.apiVersion),
    };
    assertWhatsappCredentials(credentials);
    return credentials;
  }

  private publicAccount(account: WhatsAppAccount) {
    // Explicit allowlist also protects responses immediately after repository.save().
    return {
      id: account.id,
      tenantId: account.tenantId,
      provider: account.provider,
      phoneNumberId: account.phoneNumberId,
      businessAccountId: account.businessAccountId,
      displayPhoneNumber: account.displayPhoneNumber,
      verifiedName: account.verifiedName,
      status: account.status,
      validatedAt: account.validatedAt,
      disconnectedAt: account.disconnectedAt,
      qualityRating: account.qualityRating ?? null,
      messagingLimitTier: account.messagingLimitTier ?? null,
      nameStatus: account.nameStatus ?? null,
      webhookSubscribed: account.webhookSubscribed ?? null,
      lastHealthCheckAt: account.lastHealthCheckAt ?? null,
      lastHealthError: account.lastHealthError ?? null,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      apiVersion: validateWhatsappApiVersion(this.apiVersion),
      capabilities: this.providers.capabilities(account.provider),
    };
  }

  private aad(tenantId: string, phoneNumberId: string, businessAccountId: string): Buffer {
    return Buffer.from(
      JSON.stringify([
        'whatsapp',
        'v1',
        tenantId.toLowerCase(),
        'meta',
        phoneNumberId,
        businessAccountId,
      ]),
    );
  }

  private encrypt(
    token: string,
    tenantId: string,
    phoneNumberId: string,
    businessAccountId: string,
  ): string {
    const { id, key } = this.requireEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    // The AAD's 'v1' is the binding-format version, independent of the key id.
    cipher.setAAD(this.aad(tenantId, phoneNumberId, businessAccountId));
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    return [
      id,
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  private decrypt(account: WhatsAppAccount): string {
    try {
      const parts = account.encryptedAccessToken?.split('.');
      const key = parts ? this.keys.get(parts[0]) : undefined;
      if (!parts || parts.length !== 4 || !key) throw new Error('Invalid envelope');
      const [iv, tag, encrypted] = parts.slice(1).map((value) => {
        const decoded = Buffer.from(value, 'base64');
        if (decoded.toString('base64') !== value) throw new Error('Invalid encoding');
        return decoded;
      });
      if (iv.length !== 12 || tag.length !== 16 || !encrypted.length)
        throw new Error('Invalid envelope');
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAAD(this.aad(account.tenantId, account.phoneNumberId, account.businessAccountId));
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    } catch {
      throw new ServiceUnavailableException(
        'WhatsApp credentials cannot be decrypted; reconnect the account with the configured key',
      );
    }
  }

  private requireEncryptionKey(): { id: string; key: Buffer } {
    const key = this.keys.get(this.currentKeyId);
    if (!key) {
      throw new ServiceUnavailableException(
        'WhatsApp token encryption is not configured: WHATSAPP_TOKEN_KEY_ID (default v1) must name a 32-byte key (hex or base64) in WHATSAPP_TOKEN_KEYS or, for v1, WHATSAPP_ENCRYPTION_KEY',
      );
    }
    return { id: this.currentKeyId, key };
  }

  private assertTenant(tenantId: string): void {
    if (typeof tenantId !== 'string' || !isUUID(tenantId)) {
      throw new BadRequestException('A valid tenant ID is required');
    }
  }

  private assertAccountId(id: string): void {
    if (typeof id !== 'string' || !isUUID(id))
      throw new BadRequestException('Invalid WhatsApp account ID');
  }
}
