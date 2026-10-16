import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';
import { UpsertTenantSettingDto } from '../sub-admin.dto';

@Injectable()
export class SubAdminIntegrationsService {
  constructor(
    @InjectRepository(TenantSetting) private readonly settingRepo: Repository<TenantSetting>,
  ) {}

  async findAll(tenantId: string) {
    return this.settingRepo.find({ where: { tenantId, group: 'INTEGRATION' } });
  }

  async upsert(tenantId: string, dto: UpsertTenantSettingDto) {
    const config =
      (await this.settingRepo.findOne({
        where: { tenantId, key: dto.key, group: 'INTEGRATION' },
      })) ?? this.settingRepo.create({ key: dto.key, tenantId, group: 'INTEGRATION' });
    config.value = dto.value;
    return this.settingRepo.save(config);
  }

  async remove(tenantId: string, id: string) {
    const config = await this.settingRepo.findOne({ where: { id, tenantId } });
    if (!config) throw new NotFoundException('Integration vector not found');
    return this.settingRepo.delete({ id, tenantId });
  }
}
