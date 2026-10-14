import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';

import { WhatsAppAccount } from '../../database/entities/whatsapp-account.entity';
import { ConnectWhatsappAccountDto } from './dto/whatsapp-account.dto';
import {
  assertWhatsappCredentials,
  validateWhatsappApiVersion,
  WhatsappProviderRegistry,
} from './whatsapp-provider';
import type { WhatsappCredentials } from './whatsapp-provider';

/** Internal credential contract for the existing sender. Never expose through HTTP. */
export interface WhatsappAccountCredentials extends WhatsappCredentials {
  accountId: string;
  apiVersion: string;
}

@Injectable()
export class WhatsappAccountService {
  private readonly encryptionKey?: Buffer;
  private readonly apiVersion: string;

  constructor(
    @InjectRepository(WhatsAppAccount) private readonly accounts: Repository<WhatsAppAccount>,
    private readonly providers: WhatsappProviderRegistry,
    config: ConfigService,
  ) {
    // No JWT/app secret derivation and no development fallback. Explicit 32-byte key only.
    // Accept 64 hex characters or canonical base64 encoding of exactly 32 bytes.
    const configured = config.get<string>('WHATSAPP_ENCRYPTION_KEY');
    let key: Buffer | undefined;
    if (typeof configured === 'string' && /^[0-9a-fA-F]{64}$/.test(configured)) {
      key = Buffer.from(configured, 'hex');
    } else if (typeof configured === 'string' && /^[A-Za-z0-9+/]{43}=$/.test(configured)) {
      const decoded = Buffer.from(configured, 'base64');
      if (decoded.toString('base64') === configured) key = decoded;
    }
    // WhatsApp is optional: an absent/invalid key must not prevent CRM startup.
    // Operations requiring token encryption/decryption enforce configuration lazily.
    this.encryptionKey = key?.length === 32 ? key : undefined;
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

  async connect(tenantId: string, dto: ConnectWhatsappAccountDto) {
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
    const encryptedAccessToken = this.encrypt(credentials.accessToken, tenantId, credentials);
    try {
      // Serialize updates to an existing reservation. New reservations are protected by
      // the unconditional unique index, including concurrent connects by other tenants.
      const saved = await this.accounts.manager.transaction(async (manager) => {
        const repository = manager.getRepository(WhatsAppAccount);
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
          status: 'CONNECTED',
          encryptedAccessToken,
          validatedAt: new Date(),
          disconnectedAt: null,
        });
        return repository.save(account);
      });
      return this.publicAccount(saved);
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

  async health(tenantId: string, id: string) {
    const account = await this.tenantAccount(tenantId, id, true);
    const checkedAt = new Date();
    if (account.status === 'DISCONNECTED') {
      return { accountId: account.id, status: account.status, healthy: false, checkedAt };
    }
    // Credentials are never present in the health response. Meta GETs only.
    const phone = await this.providers
      .get(account.provider)
      .readHealth(this.credentialsFor(account));
    return {
      accountId: account.id,
      status: account.status,
      credentialsValid: true,
      // Read access does not prove send readiness or billing/permission eligibility.
      healthy:
        phone.codeVerificationStatus === 'VERIFIED' &&
        phone.qualityRating !== 'RED' &&
        phone.qualityRating !== 'UNKNOWN',
      checkedAt,
      ...phone,
    };
  }

  async disconnect(tenantId: string, id: string) {
    this.assertTenant(tenantId);
    this.assertAccountId(id);
    try {
      const account = await this.accounts.manager.transaction(async (manager) => {
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
      return this.publicAccount(account);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException('Unable to disconnect the WhatsApp account');
    }
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

  private encrypt(token: string, tenantId: string, credentials: WhatsappCredentials): string {
    const key = this.requireEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(this.aad(tenantId, credentials.phoneNumberId, credentials.businessAccountId));
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    return [
      'v1',
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  private decrypt(account: WhatsAppAccount): string {
    const key = this.requireEncryptionKey();
    try {
      const parts = account.encryptedAccessToken?.split('.');
      if (!parts || parts.length !== 4 || parts[0] !== 'v1') throw new Error('Invalid envelope');
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

  private requireEncryptionKey(): Buffer {
    if (!this.encryptionKey) {
      throw new ServiceUnavailableException(
        'WHATSAPP_ENCRYPTION_KEY must encode exactly 32 bytes (hex or base64) before connecting or using WhatsApp credentials',
      );
    }
    return this.encryptionKey;
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
