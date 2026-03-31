import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageRecord } from '../../../database/entities/usage-record.entity';

@Injectable()
export class SubAdminUsageService {
  constructor(
    @InjectRepository(UsageRecord) private readonly usageRepo: Repository<UsageRecord>,
  ) {}

  async getUsageSummary(tenantId: string) {
    const records = await this.usageRepo.find({ where: { tenantId } });
    
    const summary = {
      aiTokens: records.filter(r => r.metric === 'AI').reduce((acc, r) => acc + Number(r.quantity), 0),
      smsCount: records.filter(r => r.metric === 'SMS').reduce((acc, r) => acc + Number(r.quantity), 0),
      voiceMinutes: records.filter(r => r.metric === 'VOICE').reduce((acc, r) => acc + Number(r.quantity), 0),
      storageBytes: records.filter(r => r.metric === 'STORAGE').reduce((acc, r) => acc + (r.meta?.size || 0), 0),
    };

    return summary;
  }
}
