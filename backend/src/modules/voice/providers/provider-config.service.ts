import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { VoiceProviderConfig } from '../../../database/entities/voice-provider-config.entity';

@Injectable()
export class ProviderConfigService {
  constructor(@InjectRepository(VoiceProviderConfig) private readonly repo: Repository<VoiceProviderConfig>, private readonly config: ConfigService) {}

  private key(): Buffer {
    const key = Buffer.from(this.config.get<string>('VOICE_CREDENTIAL_KEY') ?? '', 'base64');
    if (key.length !== 32) throw new ServiceUnavailableException('Provider credential encryption is not configured');
    return key;
  }

  async save(tenantId: string, provider: string, credentials: Record<string, string>, settings: Record<string, any>) {
    if (!['twilio', 'signalwire'].includes(provider)) throw new BadRequestException('Unsupported voice provider');
    const existing = await this.read(tenantId, provider);
    const merged = { ...(existing?.credentials ?? {}), ...Object.fromEntries(Object.entries(credentials).filter(([, value]) => value)) };
    if (!merged.accountSid || !merged.authToken) throw new BadRequestException('Account/project ID and auth token are required');
    if (provider === 'signalwire' && !/^[a-z0-9-]+\.signalwire\.com$/.test(merged.space ?? '')) throw new BadRequestException('A valid SignalWire Space hostname is required');
    if (provider === 'signalwire' && !merged.signingKey) throw new BadRequestException('SignalWire webhook signing key is required');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    cipher.setAAD(Buffer.from(`${tenantId}:${provider}`));
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(merged)), cipher.final()]);
    const encrypted = [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64')).join('.');
    await this.repo.upsert({ tenantId, provider, credentials: encrypted, settings }, ['tenantId', 'provider']);
    return { provider, configured: true, settings };
  }

  async read(tenantId: string, provider: string): Promise<{ credentials: Record<string, string>; settings: Record<string, any> } | null> {
    const row = await this.repo.createQueryBuilder('p').addSelect('p.credentials').where('p.tenantId = :tenantId AND p.provider = :provider', { tenantId, provider }).getOne();
    if (!row) return null;
    const [iv, tag, ciphertext] = row.credentials.split('.').map((part) => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', this.key(), iv);
    decipher.setAAD(Buffer.from(`${tenantId}:${provider}`));
    decipher.setAuthTag(tag);
    return { credentials: JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString()), settings: row.settings };
  }
}
