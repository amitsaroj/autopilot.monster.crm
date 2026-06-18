import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
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

export interface ApiKeyCreatedResult {
  id: string;
  name: string;
  keyPrefix: string;
  key: string;
  permissions: string[];
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

  async listApiKeys(tenantId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async createApiKey(
    tenantId: string,
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<ApiKeyCreatedResult> {
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
        permissions: dto.permissions ?? [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      }),
    );

    return {
      id: entity.id,
      name: entity.name,
      keyPrefix: entity.keyPrefix,
      key: rawKey,
      permissions: entity.permissions,
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

  async listWebhooks(tenantId: string): Promise<Webhook[]> {
    return this.webhookRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async createWebhook(tenantId: string, dto: CreateWebhookDto): Promise<Webhook> {
    const secret = randomBytes(32).toString('hex');
    return this.webhookRepository.save(
      this.webhookRepository.create({
        tenantId,
        name: dto.name,
        url: dto.url,
        secret,
        events: dto.events,
        status: 'ACTIVE',
      }),
    );
  }

  async updateWebhook(tenantId: string, id: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const webhook = await this.webhookRepository.findOne({ where: { id, tenantId } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    if (dto.name !== undefined) webhook.name = dto.name;
    if (dto.url !== undefined) webhook.url = dto.url;
    if (dto.events !== undefined) webhook.events = dto.events;
    if (dto.status !== undefined) webhook.status = dto.status;

    return this.webhookRepository.save(webhook);
  }

  async deleteWebhook(tenantId: string, id: string): Promise<void> {
    const webhook = await this.webhookRepository.findOne({ where: { id, tenantId } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    await this.webhookRepository.softDelete({ id, tenantId });
  }

  async testWebhook(tenantId: string, id: string): Promise<{ delivered: boolean; statusCode: number }> {
    const webhook = await this.webhookRepository.findOne({ where: { id, tenantId } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhook.secret ?? '',
      },
      body: JSON.stringify({
        event: 'webhook.test',
        tenantId,
        timestamp: new Date().toISOString(),
      }),
    });

    const delivered = response.ok;
    if (delivered) {
      webhook.lastSuccessAt = new Date();
      webhook.failureCount = 0;
    } else {
      webhook.lastFailureAt = new Date();
      webhook.failureCount += 1;
    }
    await this.webhookRepository.save(webhook);

    return { delivered, statusCode: response.status };
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
      clientSecretPrefix: entity.clientSecretPrefix,
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
