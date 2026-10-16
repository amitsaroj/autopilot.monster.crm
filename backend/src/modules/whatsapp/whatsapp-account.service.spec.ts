import { BadRequestException, BadGatewayException, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { createCipheriv, randomBytes } from 'crypto';
import type { Repository } from 'typeorm';

import type { WhatsAppAccount } from '../../database/entities/whatsapp-account.entity';
import { WhatsappAccountService } from './whatsapp-account.service';
import type {
  WhatsappDiagnostics,
  WhatsappPhoneHealth,
  WhatsappProvider,
  WhatsappProviderRegistry,
} from './whatsapp-provider';

const TENANT_A = '11111111-1111-4111-8111-111111111111';
const TENANT_B = '22222222-2222-4222-8222-222222222222';
const KEY_V1 = randomBytes(32).toString('hex');
const KEY_V2 = randomBytes(32).toString('base64');
const WABA = '200';

const phone: WhatsappPhoneHealth = {
  phoneNumberId: '100',
  displayPhoneNumber: '+1 555 0100',
  verifiedName: 'Acme',
  qualityRating: 'GREEN',
  codeVerificationStatus: 'VERIFIED',
};

type Row = WhatsAppAccount;

/** Minimal in-memory stand-in for the repository/query-builder calls the service makes. */
function fakeRepository(rows: Row[]) {
  let sequence = 0;
  const matches = (row: Row, criteria: Partial<Row>) =>
    (Object.keys(criteria) as Array<keyof Row>).every((key) => row[key] === criteria[key]);
  const queryBuilder = () => {
    const params: Record<string, string> = {};
    let notNullToken = false;
      let otherTenantForWaba: string | undefined;
    let limit = Infinity;
    const qb = {
      withDeleted: () => qb,
      addSelect: () => qb,
      setLock: () => qb,
      orderBy: () => qb,
      take: (n: number) => ((limit = n), qb),
      where: (clause: string, values?: Record<string, string>) => {
        if (clause.includes('IS NOT NULL')) notNullToken = true;
        Object.assign(params, values);
        return qb;
      },
      andWhere: (clause: string, values?: Record<string, string>) => {
        if (clause.includes('account.tenantId <>'))
          otherTenantForWaba = values?.tenantId;
        return qb.where(clause, values);
      },
      getMany: async () =>
        rows
          .filter(
            (row) =>
              (!params.tenantId || row.tenantId === params.tenantId) &&
              (!params.id || row.id === params.id) &&
              (!params.phone || row.phoneNumberId === params.phone) &&
              (!params.status || row.status === params.status) &&
              (!params.businessAccountId || row.businessAccountId === params.businessAccountId) &&
              (!otherTenantForWaba || row.tenantId !== otherTenantForWaba) &&
              (!params.lastId || row.id > params.lastId) &&
              (!notNullToken || row.encryptedAccessToken !== null),
          )
          .sort((a, b) => a.id.localeCompare(b.id))
          .slice(0, limit)
          .map((row) => ({ ...row })),
      getOne: async () => (await qb.getMany())[0] ?? null,
    };
    return qb;
  };
  const repository = {
    createQueryBuilder: queryBuilder,
    create: (values: Partial<Row>) => ({ ...values }) as Row,
    save: async (row: Row) => {
      const existing = rows.find((candidate) => candidate.id === row.id);
      if (existing) Object.assign(existing, row);
      else {
        row.id ??= `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`;
        rows.push({ ...row });
      }
      return { ...row };
    },
    find: async ({ where }: { where: Partial<Row> }) => rows.filter((row) => matches(row, where)),
    count: async ({ where }: { where: Partial<Row> }) =>
      rows.filter((row) => matches(row, where)).length,
    update: jest.fn(async (criteria: Partial<Row>, values: Partial<Row>) => {
      const hit = rows.filter((row) => matches(row, criteria));
      hit.forEach((row) => Object.assign(row, values));
      return { affected: hit.length };
    }),
  };
  const manager = { transaction: async <T>(work: (m: unknown) => Promise<T>) => work(managerApi) };
  const managerApi = { getRepository: () => repository, query: async () => [] };
  return Object.assign(repository, { manager }) as unknown as Repository<WhatsAppAccount> & {
    update: jest.Mock;
  };
}

function setup(env: Record<string, string>, rows: Row[] = []) {
  const provider = {
    name: 'meta',
    capabilities: {},
    validateCredentials: jest.fn().mockResolvedValue(phone),
    readHealth: jest.fn(),
    exchangeSignupCode: jest.fn().mockResolvedValue('EAAG-business-token'),
    subscribeApp: jest.fn().mockResolvedValue(undefined),
    unsubscribeApp: jest.fn().mockResolvedValue(undefined),
    registerPhone: jest.fn().mockResolvedValue(undefined),
    send: jest.fn(),
    sendContent: jest.fn(),
    uploadMedia: jest.fn().mockResolvedValue('12345'),
    downloadMedia: jest.fn().mockResolvedValue({ buffer: Buffer.from(''), mimeType: 'image/jpeg' }),
  } satisfies Record<keyof WhatsappProvider, unknown>;
  const registry = {
    get: () => provider,
    capabilities: () => ({}),
  } as unknown as WhatsappProviderRegistry;
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const repository = fakeRepository(rows);
  return {
    service: new WhatsappAccountService(repository, registry, config),
    provider,
    repository,
    rows,
  };
}

const legacyEnv = { WHATSAPP_ENCRYPTION_KEY: KEY_V1 };
const signup = { code: 'AQB-code', businessAccountId: WABA, phoneNumberId: '100' };

async function connected(env: Record<string, string> = legacyEnv) {
  const ctx = setup(env);
  await ctx.service.embeddedSignup(TENANT_A, signup);
  jest.clearAllMocks();
  return ctx;
}

describe('WhatsappAccountService embedded signup', () => {
  it('exchanges the code, validates ownership, stores the token encrypted and subscribes the app', async () => {
    const { service, provider, rows } = setup(legacyEnv);
    const result = await service.embeddedSignup(TENANT_A, signup);

    expect(provider.exchangeSignupCode).toHaveBeenCalledWith('AQB-code');
    const credentials = expect.objectContaining({
      phoneNumberId: '100',
      businessAccountId: WABA,
      accessToken: 'EAAG-business-token',
    });
    expect(provider.validateCredentials).toHaveBeenCalledWith(credentials);
    expect(provider.subscribeApp).toHaveBeenCalledWith(credentials);
    expect(provider.registerPhone).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'CONNECTED',
      webhookSubscribed: true,
      setupWarnings: [],
    });
    expect(JSON.stringify(result)).not.toContain('EAAG');
    expect(rows[0].encryptedAccessToken).toMatch(/^v1\./);
    expect(rows[0].encryptedAccessToken).not.toContain('EAAG');
    await expect(service.getCredentials(TENANT_A)).resolves.toMatchObject({
      accessToken: 'EAAG-business-token',
    });
  });

  it('registers the phone only when a PIN is supplied', async () => {
    const { service, provider } = setup(legacyEnv);
    await service.embeddedSignup(TENANT_A, { ...signup, pin: '123456' });
    expect(provider.registerPhone).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumberId: '100' }),
      '123456',
    );
  });

  it('fails without storing anything when the code exchange fails', async () => {
    const { service, provider, rows } = setup(legacyEnv);
    provider.exchangeSignupCode.mockRejectedValue(new BadRequestException('expired code'));
    await expect(service.embeddedSignup(TENANT_A, signup)).rejects.toThrow('expired code');
    expect(provider.validateCredentials).not.toHaveBeenCalled();
    expect(rows).toHaveLength(0);
  });

  it('does not burn the code when no encryption key is configured', async () => {
    const { service, provider } = setup({});
    await expect(service.embeddedSignup(TENANT_A, signup)).rejects.toThrow(/not configured/);
    expect(provider.exchangeSignupCode).not.toHaveBeenCalled();
  });

  it('rejects a WABA/phone ownership mismatch without storing or subscribing', async () => {
    const { service, provider, rows } = setup(legacyEnv);
    provider.validateCredentials.mockRejectedValue(
      new BadRequestException('The requested phone does not belong to the accessible WABA'),
    );
    await expect(service.embeddedSignup(TENANT_A, signup)).rejects.toThrow(/does not belong/);
    expect(rows).toHaveLength(0);
    expect(provider.subscribeApp).not.toHaveBeenCalled();
  });

  it('keeps the stored token and reports a warning when subscribing fails', async () => {
    const { service, provider, rows } = setup(legacyEnv);
    provider.subscribeApp.mockRejectedValue(
      new BadGatewayException('Meta WhatsApp request failed'),
    );
    const result = await service.embeddedSignup(TENANT_A, signup);
    expect(result.status).toBe('CONNECTED');
    expect(result.setupWarnings).toEqual([
      'Webhook subscription failed: Meta WhatsApp request failed',
    ]);
    expect(rows[0]).toMatchObject({ webhookSubscribed: null, status: 'CONNECTED' });
    expect(rows[0].lastHealthError).toContain('Webhook subscription failed');
  });
});

describe('WhatsappAccountService disconnect', () => {
  it('unsubscribes the app when the last connected number of the WABA disconnects', async () => {
    const { service, provider, rows } = await connected();
    const result = await service.disconnect(TENANT_A, rows[0].id);
    expect(provider.unsubscribeApp).toHaveBeenCalledWith(
      expect.objectContaining({ businessAccountId: WABA, accessToken: 'EAAG-business-token' }),
    );
    expect(result).toMatchObject({ status: 'DISCONNECTED', remoteUnsubscribe: 'UNSUBSCRIBED' });
    expect(rows[0]).toMatchObject({ encryptedAccessToken: null, webhookSubscribed: false });
  });

  it('keeps the subscription while another number shares the WABA', async () => {
    const { service, provider, rows } = await connected();
    provider.validateCredentials.mockResolvedValue({ ...phone, phoneNumberId: '101' });
    await service.embeddedSignup(TENANT_A, { ...signup, phoneNumberId: '101' });
    const result = await service.disconnect(TENANT_A, rows[0].id);
    expect(result.remoteUnsubscribe).toBe('SKIPPED_SHARED_WABA');
    expect(provider.unsubscribeApp).not.toHaveBeenCalled();
  });

  it('completes the local disconnect when Meta is unreachable and records the failure', async () => {
    const { service, provider, rows } = await connected();
    provider.unsubscribeApp.mockRejectedValue(
      new BadGatewayException('Meta WhatsApp request failed'),
    );
    const result = await service.disconnect(TENANT_A, rows[0].id);
    expect(result).toMatchObject({ status: 'DISCONNECTED', remoteUnsubscribe: 'FAILED' });
    expect(rows[0].encryptedAccessToken).toBeNull();
    expect(rows[0].lastHealthError).toBe(
      'Meta app unsubscribe failed on disconnect: Meta WhatsApp request failed',
    );
  });
});

describe('WhatsappAccountService tenant isolation', () => {
  it('tenant B cannot disconnect or health-check tenant A account', async () => {
    const { service, provider, rows } = await connected();
    const id = rows[0].id;
    await expect(service.disconnect(TENANT_B, id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.health(TENANT_B, id)).rejects.toBeInstanceOf(NotFoundException);
    expect(rows[0].status).toBe('CONNECTED');
    expect(rows[0].encryptedAccessToken).not.toBeNull();
    expect(provider.unsubscribeApp).not.toHaveBeenCalled();
    expect(provider.readHealth).not.toHaveBeenCalled();
  });
});

describe('WhatsappAccountService health', () => {
  it('persists diagnostics on the account', async () => {
    const { service, provider, rows } = await connected();
    const diagnostics: WhatsappDiagnostics = {
      ...phone,
      qualityRating: 'YELLOW',
      nameStatus: 'APPROVED',
      messagingLimitTier: 'TIER_1K',
      webhookSubscribed: true,
    };
    provider.readHealth.mockResolvedValue(diagnostics);
    const result = await service.health(TENANT_A, rows[0].id);
    expect(result).toMatchObject({ healthy: true, error: null, messagingLimitTier: 'TIER_1K' });
    expect(rows[0]).toMatchObject({
      qualityRating: 'YELLOW',
      nameStatus: 'APPROVED',
      messagingLimitTier: 'TIER_1K',
      webhookSubscribed: true,
      lastHealthError: null,
    });
    expect(rows[0].lastHealthCheckAt).toBeInstanceOf(Date);
  });

  it('records a failed check instead of throwing', async () => {
    const { service, provider, rows } = await connected();
    provider.readHealth.mockRejectedValue(new BadRequestException('Meta rejected the credentials'));
    const result = await service.health(TENANT_A, rows[0].id);
    expect(result).toMatchObject({ healthy: false, credentialsValid: false });
    expect(rows[0].lastHealthError).toBe('Meta rejected the credentials');
  });
});

describe('WhatsappAccountService token keyring', () => {
  /** Exactly what the pre-keyring code wrote: `v1.` envelope, AAD bound to tenant/phone/WABA. */
  function legacyEnvelope(token: string, tenantId: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', Buffer.from(KEY_V1, 'hex'), iv);
    cipher.setAAD(Buffer.from(JSON.stringify(['whatsapp', 'v1', tenantId, 'meta', '100', WABA])));
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    return [
      'v1',
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }
  const legacyRow = (): Row =>
    ({
      id: '00000000-0000-4000-8000-0000000000aa',
      tenantId: TENANT_A,
      provider: 'meta',
      phoneNumberId: '100',
      businessAccountId: WABA,
      status: 'CONNECTED',
      encryptedAccessToken: legacyEnvelope('legacy-token', TENANT_A),
    }) as Row;
  const rotatedEnv = {
    WHATSAPP_ENCRYPTION_KEY: KEY_V1,
    WHATSAPP_TOKEN_KEYS: `v2:${KEY_V2}`,
    WHATSAPP_TOKEN_KEY_ID: 'v2',
  };

  it('decrypts tokens written before the keyring existed', async () => {
    const { service } = setup(legacyEnv, [legacyRow()]);
    await expect(service.getCredentials(TENANT_A)).resolves.toMatchObject({
      accessToken: 'legacy-token',
    });
  });

  it('writes new tokens with the current key while old v1 tokens still decrypt', async () => {
    const { service, rows } = setup(rotatedEnv, [legacyRow()]);
    await expect(service.getCredentials(TENANT_A, '100')).resolves.toMatchObject({
      accessToken: 'legacy-token',
    });
    await service.embeddedSignup(TENANT_A, { ...signup, phoneNumberId: '101' });
    const added = rows.find((row) => row.phoneNumberId === '101');
    expect(added?.encryptedAccessToken).toMatch(/^v2\./);
    await expect(service.getCredentials(TENANT_A, '101')).resolves.toMatchObject({
      accessToken: 'EAAG-business-token',
    });
  });

  it('re-encrypts all tokens to the current key', async () => {
    const { service, rows } = setup(rotatedEnv, [legacyRow()]);
    await expect(service.reEncryptAllTokens()).resolves.toEqual({ reencrypted: 1, failed: 0 });
    expect(rows[0].encryptedAccessToken).toMatch(/^v2\./);
    await expect(service.reEncryptAllTokens()).resolves.toEqual({ reencrypted: 0, failed: 0 });

    // After rotation the old key can be removed.
    const { service: v2Only } = setup(
      { WHATSAPP_TOKEN_KEYS: `v2:${KEY_V2}`, WHATSAPP_TOKEN_KEY_ID: 'v2' },
      rows,
    );
    await expect(v2Only.getCredentials(TENANT_A)).resolves.toMatchObject({
      accessToken: 'legacy-token',
    });
  });

  it('refuses tokens whose key id is not in the keyring', async () => {
    const { service } = setup(
      { WHATSAPP_TOKEN_KEYS: `v2:${KEY_V2}`, WHATSAPP_TOKEN_KEY_ID: 'v2' },
      [legacyRow()],
    );
    await expect(service.getCredentials(TENANT_A)).rejects.toThrow(/cannot be decrypted/);
  });
});
