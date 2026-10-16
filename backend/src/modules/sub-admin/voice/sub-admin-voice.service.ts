import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';
import { ProvisionVoiceNumberDto } from '../sub-admin.dto';

@Injectable()
export class SubAdminVoiceService {
  constructor(
    @InjectRepository(TenantSetting) private readonly configRepo: Repository<TenantSetting>,
  ) {}

  async findNumbers(tenantId: string) {
    return this.configRepo.find({ where: { tenantId, group: 'VOICE_NUMBER' } });
  }

  async provisionNumber(tenantId: string, dto: ProvisionVoiceNumberDto) {
    const config = this.configRepo.create({
      tenantId,
      group: 'VOICE_NUMBER',
      key: dto.phoneNumber,
      value: { phoneNumber: dto.phoneNumber, country: dto.country ?? null },
    });
    return this.configRepo.save(config);
  }
}
