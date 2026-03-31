import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';

@Injectable()
export class SubAdminVoiceService {
  constructor(
    @InjectRepository(TenantSetting) private readonly configRepo: Repository<TenantSetting>,
  ) {}

  async findNumbers(tenantId: string) {
    return this.configRepo.find({ where: { tenantId, group: 'VOICE_NUMBER' } });
  }

  async provisionNumber(tenantId: string, dto: any) {
    const config = this.configRepo.create({ ...dto, tenantId, group: 'VOICE_NUMBER' });
    return this.configRepo.save(config);
  }
}
