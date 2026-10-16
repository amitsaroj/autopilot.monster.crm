import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { ApiKey } from '../../database/entities/api-key.entity';

@Injectable()
export class ApiKeyAuthService {
  constructor(@InjectRepository(ApiKey) private readonly keys: Repository<ApiKey>) {}

  async getRateLimit(rawKey: string): Promise<{ id: string; rateLimit: number } | null> {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const key = await this.keys.findOne({
      where: { keyHash, status: 'ACTIVE' },
      select: { id: true, rateLimit: true, expiresAt: true },
    });
    if (!key || (key.expiresAt && key.expiresAt <= new Date())) return null;
    return { id: key.id, rateLimit: key.rateLimit };
  }

  async authenticate(rawKey: string): Promise<ApiKey | null> {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const key = await this.keys.findOne({ where: { keyHash, status: 'ACTIVE' } });
    if (!key) return null;
    if (key.expiresAt && key.expiresAt <= new Date()) {
      await this.keys.update({ id: key.id, tenantId: key.tenantId }, { status: 'EXPIRED' });
      return null;
    }
    await this.keys.update({ id: key.id, tenantId: key.tenantId }, { lastUsedAt: new Date() });
    return key;
  }
}
