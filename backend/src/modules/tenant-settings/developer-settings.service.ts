import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, createHmac, randomBytes } from 'crypto';
import axios from 'axios';
import { Repository } from 'typeorm';

import { ApiKey } from '../../database/entities/api-key.entity';
import { OAuthApp } from '../../database/entities/oauth-app.entity';
import { Webhook } from '../../database/entities/webhook.entity';
import {
  CreateApiKeyDto,
  CreateOAuthAppDto,
  CreateWebhookDto,
  UpdateWebhookDto,
} from './dto/developer-settings.dto';
import { publicWebhookAgents, validateWebhookUrl } from '../workflow/workflow-webhook.util';
import { assertGrantablePermissions } from '../../common/utils/role-policy';

export interface ApiKeyCreatedResult {
  id: string;
  name: string;
  keyPrefix: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  expiresAt?: Date;
  createdAt: Date;
}

export interface OAuthAppCreatedResult {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  clientSecretPrefix: string;
  redirectUris: string[];
  scopes: string[];
  isActive: boolean;
  createdAt: Date;
}

type PublicWebhook = Omit<Webhook, 'tenantId' | 'secret'>;
type PublicApiKey = Pick<
  ApiKey,
  | 'id'
  | 'name'
  | 'keyPrefix'
  | 'status'
  | 'permissions'
  | 'scopes'
  | 'rateLimit'
  | 'lastUsedAt'
  | 'expiresAt'
  | 'createdAt'
>;

@Injectable()
export class DeveloperSettingsService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
    @InjectRepository(OAuthApp)
    private readonly oauthAppRepository: Repository<OAuthApp>,
  ) {}

  async listApiKeys(tenantId: string): Promise<PublicApiKey[]> {
    const keys = await this.apiKeyRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return keys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      status: key.status,
      permissions: key.permissions,
      scopes: key.scopes,
      rateLimit: key.rateLimit,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    }));
  }

  async createApiKey(
    tenantId: string,
    userId: string,
    dto: CreateApiKeyDto,
    actorPermissions: readonly string[],
    actorRoles: readonly string[],
  ): Promise<ApiKeyCreatedResult> {
    if (dto.expiresAt && new Date(dto.expiresAt) <= new Date())
      throw new BadRequestException('API key expiry must be in the future');
    const permissions = [...new Set(dto.permissions ?? [])];
    assertGrantablePermissions(
      permissions.map((name) => ({ resource: name.split(':')[0] ?? '', name })),
      actorRoles,
    );
    const cannotGrant = permissions.find((permission) => {
      const [resource, action] = permission.split(':');
      return !(
        actorPermissions.includes(permission) ||
        actorPermissions.includes(`${resource}:manage`) ||
        (action === 'read' && actorPermissions.includes(`${resource}:view`))
      );
    });
    if (cannotGrant)
      throw new ForbiddenException(`You cannot grant the API key permission "${cannotGrant}"`);
    const rawKey = `sk_live_${randomBytes(24).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 12);

    const entity = await this.apiKeyRepository.save(
      this.apiKeyRepository.create({
        tenantId,
        userId,
        name: dto.name,
        keyPrefix,
        keyHash,
        permissions,
        scopes: permissions,
        rateLimit: dto.rateLimit ?? 1000,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      }),
    );

    return {
      id: entity.id,
      name: entity.name,
      keyPrefix: entity.keyPrefix,
      key: rawKey,
      permissions: entity.permissions,
      rateLimit: entity.rateLimit,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
    };
  }

  async revokeApiKey(tenantId: string, id: string): Promise<void> {
    const key = await this.apiKeyRepository.findOne({ where: { id, tenantId } });
    if (!key) {
      throw new NotFoundException('API key not found');
    }
    await this.apiKeyRepository.softDelete({ id, tenantId });
  }

  async listWebhooks(tenantId: string): Promise<PublicWebhook[]> {
    const webhooks = await this.webhookRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return webhooks.map(({ tenantId: _tenantId, secret: _secret, ...webhook }) => {
      void _tenantId;
      void _secret;
      return webhook;
    });
  }

  async createWebhook(tenantId: string, dto: CreateWebhookDto): Promise<Omit<Webhook, 'tenantId'>> {
    if (validateWebhookUrl(dto.url).protocol !== 'https:') {
      throw new BadRequestException('Webhook URL must use HTTPS');
    }
    const secret = randomBytes(32).toString('hex');
    const webhook = await this.webhookRepository.save(
      this.webhookRepository.create({
        tenantId,
        name: dto.name,
        url: dto.url,
        secret,
        events: dto.events,
        status: 'ACTIVE',
      }),
    );
    const { tenantId: _tenantId, ...result } = webhook;
    void _tenantId;
    return result;
  }

  async updateWebhook(tenantId: string, id: string, dto: UpdateWebhookDto): Promise<PublicWebhook> {
    const webhook = await this.webhookRepository.findOne({ where: { id, tenantId } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    if (dto.name !== undefined) webhook.name = dto.name;
    if (dto.url !== undefined) {
      if (validateWebhookUrl(dto.url).protocol !== 'https:') {
        throw new BadRequestException('Webhook URL must use HTTPS');
      }
      webhook.url = dto.url;
    }
    if (dto.events !== undefined) webhook.events = dto.events;
    if (dto.status !== undefined) webhook.status = dto.status;

    const updated = await this.webhookRepository.save(webhook);
    const { tenantId: _tenantId, secret: _secret, ...result } = updated;
    void _tenantId;
    void _secret;
    return result;
  }

  async deleteWebhook(tenantId: string, id: string): Promise<void> {
    const webhook = await this.webhookRepository.findOne({ where: { id, tenantId } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    await this.webhookRepository.softDelete({ id, tenantId });
  }

  async testWebhook(
    tenantId: string,
    id: string,
  ): Promise<{ delivered: boolean; statusCode: number }> {
    const webhook = await this.webhookRepository.findOne({ where: { id, tenantId } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const body = JSON.stringify({
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
    });
    // SSRF-safe: validates + pins a public DNS answer; no redirects, bounded time/size.
    // The secret itself never leaves the server; receivers verify the HMAC signature.
    const agents = await publicWebhookAgents(webhook.url);
    let statusCode = 0;
    try {
      const response = await axios.request<unknown>({
        url: webhook.url,
        method: 'POST',
        data: body,
        ...agents,
        proxy: false,
        maxRedirects: 0,
        timeout: 10000,
        signal: AbortSignal.timeout(10000),
        maxContentLength: 65536,
        maxBodyLength: 1048576,
        responseType: 'text',
        validateStatus: () => true,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': createHmac('sha256', webhook.secret ?? '')
            .update(body)
            .digest('hex'),
          'X-Webhook-Event': 'webhook.test',
        },
      });
      statusCode = response.status;
    } catch {
      // Transport failure (timeout, refused, oversize): recorded as not delivered.
    } finally {
      agents.httpAgent.destroy();
      agents.httpsAgent.destroy();
    }

    const delivered = statusCode >= 200 && statusCode < 300;
    if (delivered) {
      webhook.lastSuccessAt = new Date();
      webhook.failureCount = 0;
    } else {
      webhook.lastFailureAt = new Date();
      webhook.failureCount += 1;
    }
    await this.webhookRepository.save(webhook);

    return { delivered, statusCode };
  }

  async listOAuthApps(tenantId: string): Promise<OAuthApp[]> {
    return this.oauthAppRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async createOAuthApp(tenantId: string, dto: CreateOAuthAppDto): Promise<OAuthAppCreatedResult> {
    const rawSecret = `cs_live_${randomBytes(24).toString('hex')}`;
    const clientId = `ca_${randomBytes(12).toString('hex')}`;
    const secretHash = createHash('sha256').update(rawSecret).digest('hex');
    const secretPrefix = rawSecret.slice(0, 12);

    const entity = await this.oauthAppRepository.save(
      this.oauthAppRepository.create({
        tenantId,
        name: dto.name,
        clientId,
        clientSecretHash: secretHash,
        clientSecretPrefix: secretPrefix,
        redirectUris: dto.redirectUris,
        scopes: dto.scopes ?? ['crm:read'],
        isActive: true,
      }),
    );

    return {
      id: entity.id,
      name: entity.name,
      clientId: entity.clientId,
      clientSecret: rawSecret,
      clientSecretPrefix: entity.clientSecretPrefix!,
      redirectUris: entity.redirectUris,
      scopes: entity.scopes,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }

  async revokeOAuthApp(tenantId: string, id: string): Promise<void> {
    const app = await this.oauthAppRepository.findOne({ where: { id, tenantId } });
    if (!app) {
      throw new NotFoundException('OAuth app not found');
    }
    await this.oauthAppRepository.softDelete({ id, tenantId });
  }
}
