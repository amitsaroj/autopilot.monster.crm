import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';
import { UpsertTenantSettingDto } from '../sub-admin.dto';

@Injectable()
export class SubAdminAiService {
  constructor(
    @InjectRepository(TenantSetting) private readonly configRepo: Repository<TenantSetting>,
  ) {}

  async findConfigs(tenantId: string) {
    return this.configRepo.find({ where: { tenantId, group: 'AI' } });
  }

  async updateConfig(tenantId: string, dto: UpsertTenantSettingDto) {
    const config =
      (await this.configRepo.findOne({ where: { tenantId, key: dto.key, group: 'AI' } })) ??
      this.configRepo.create({ key: dto.key, tenantId, group: 'AI' });
    config.value = dto.value;
    return this.configRepo.save(config);
  }
}
