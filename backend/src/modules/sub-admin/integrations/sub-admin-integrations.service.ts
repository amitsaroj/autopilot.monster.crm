import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';

@Injectable()
export class SubAdminIntegrationsService {
  constructor(
    @InjectRepository(TenantSetting) private readonly settingRepo: Repository<TenantSetting>,
  ) {}

  async findAll(tenantId: string) {
    return this.settingRepo.find({ where: { tenantId, group: 'INTEGRATION' } });
  }

  async upsert(tenantId: string, dto: any) {
    const config = await this.settingRepo.findOne({ where: { tenantId, key: dto.key } });
    if (config) {
      config.value = dto.value;
      return this.settingRepo.save(config);
    } else {
      const newConfig = this.settingRepo.create({ ...dto, tenantId, group: 'INTEGRATION' });
      return this.settingRepo.save(newConfig);
    }
  }

  async remove(tenantId: string, id: string) {
    const config = await this.settingRepo.findOne({ where: { id, tenantId } });
    if (!config) throw new NotFoundException('Integration vector not found');
    return this.settingRepo.delete(id);
  }
}
