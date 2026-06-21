import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IpWhitelist, ConsentRecord } from '../../database/entities/security.entity';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(IpWhitelist)
    private readonly ipRepo: Repository<IpWhitelist>,
    @InjectRepository(ConsentRecord)
    private readonly consentRepo: Repository<ConsentRecord>,
  ) {}

  // --- IP Whitelist ---
  async addIp(tenantId: string, ipAddress: string, description?: string): Promise<IpWhitelist> {
    const entry = this.ipRepo.create({ tenantId, ipAddress, description } as any) as unknown as IpWhitelist;
    return this.ipRepo.save(entry) as unknown as Promise<IpWhitelist>;
  }

  async getIps(tenantId: string): Promise<IpWhitelist[]> {
    return this.ipRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async removeIp(tenantId: string, id: string): Promise<void> {
    const entry = await this.ipRepo.findOne({ where: { id, tenantId } as any });
    if (!entry) throw new NotFoundException('IP entry not found');
    await this.ipRepo.softRemove(entry);
  }

  async isIpAllowed(tenantId: string, ip: string): Promise<boolean> {
    const whitelist = await this.ipRepo.find({ where: { tenantId, enabled: true } as any });
    if (whitelist.length === 0) return true; // No whitelist = allow all
    return whitelist.some(e => e.ipAddress === ip);
  }

  // --- Consent Tracking ---
  async recordConsent(tenantId: string, contactId: string, consentType: string, granted: boolean, source?: string, ipAddress?: string): Promise<ConsentRecord> {
    const record = this.consentRepo.create({
      tenantId, contactId, consentType, granted,
      grantedAt: granted ? new Date() : undefined,
      revokedAt: !granted ? new Date() : undefined,
      source, ipAddress,
    } as any) as unknown as ConsentRecord;
    return this.consentRepo.save(record) as unknown as Promise<ConsentRecord>;
  }

  async getConsent(tenantId: string, contactId: string): Promise<ConsentRecord[]> {
    return this.consentRepo.find({ where: { tenantId, contactId } as any, order: { createdAt: 'DESC' } });
  }

  async hasConsent(tenantId: string, contactId: string, consentType: string): Promise<boolean> {
    const latest = await this.consentRepo.findOne({
      where: { tenantId, contactId, consentType } as any,
      order: { createdAt: 'DESC' },
    });
    return latest?.granted ?? false;
  }

  async revokeConsent(tenantId: string, contactId: string, consentType: string): Promise<ConsentRecord> {
    return this.recordConsent(tenantId, contactId, consentType, false, 'manual_revoke');
  }

  // --- GDPR Data Export ---
  async exportContactData(tenantId: string, contactId: string): Promise<Record<string, any>> {
    const consents = await this.consentRepo.find({ where: { tenantId, contactId } as any });
    return {
      contactId,
      tenantId,
      consents,
      exportedAt: new Date().toISOString(),
      note: 'Full contact data export would include activities, messages, and associated records',
    };
  }
}
