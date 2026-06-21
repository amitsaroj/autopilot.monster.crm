import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from '../../database/entities/api-key.entity';
import { CreateApiKeyDto } from './dto/tenant-features.dto';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  /** Generate a new API key and return the raw key (only shown once) */
  async create(tenantId: string, dto: CreateApiKeyDto): Promise<{ key: string; apiKey: ApiKey }> {
    const rawKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 12);

    const apiKey = this.apiKeyRepo.create({
      tenantId,
      name: dto.name,
      keyHash,
      keyPrefix,
      scopes: dto.scopes || ['*'],
      rateLimit: dto.rateLimit || 1000,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    const saved = await this.apiKeyRepo.save(apiKey);
    this.logger.log(`API key created for tenant ${tenantId}: ${keyPrefix}...`);

    return { key: rawKey, apiKey: saved };
  }

  async findAll(tenantId: string): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      where: { tenantId } as any,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<ApiKey> {
    const key = await this.apiKeyRepo.findOne({ where: { id, tenantId } as any });
    if (!key) throw new NotFoundException('API key not found');
    return key;
  }

  /** Validate an incoming API key and update lastUsedAt */
  async validateKey(rawKey: string): Promise<ApiKey | null> {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.apiKeyRepo.findOne({ where: { keyHash, status: 'ACTIVE' } as any });

    if (!apiKey) return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      apiKey.status = 'EXPIRED';
      await this.apiKeyRepo.save(apiKey);
      return null;
    }

    apiKey.lastUsedAt = new Date();
    await this.apiKeyRepo.save(apiKey);
    return apiKey;
  }

  async revoke(tenantId: string, id: string): Promise<ApiKey> {
    const key = await this.findOne(tenantId, id);
    if (key.status === 'REVOKED') {
      throw new BadRequestException('Key is already revoked');
    }
    key.status = 'REVOKED';
    return this.apiKeyRepo.save(key);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const key = await this.findOne(tenantId, id);
    await this.apiKeyRepo.softRemove(key);
  }
}
