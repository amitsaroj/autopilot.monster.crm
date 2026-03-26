import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../database/entities/tenant-setting.entity';

@Injectable()
export class TenantSettingsService {
  constructor(
    @InjectRepository(TenantSetting)
    private readonly settingRepo: Repository<TenantSetting>,
  ) {}

  async findAll(tenantId: string) {
    return this.settingRepo.find({ where: { tenantId } });
  }

  async findByGroup(tenantId: string, group: string) {
    return this.settingRepo.find({ where: { tenantId, group } });
  }

  async getSetting(tenantId: string, key: string) {
    return this.settingRepo.findOne({ where: { tenantId, key } });
  }

  async updateSetting(tenantId: string, data: { key: string; value: any; group?: string }) {
    let setting = await this.settingRepo.findOne({ where: { tenantId, key: data.key } });
    if (!setting) {
      setting = this.settingRepo.create({ ...data, tenantId });
    } else {
      setting.value = data.value;
      if (data.group) setting.group = data.group;
    }
    return this.settingRepo.save(setting);
  }

  async removeSetting(tenantId: string, key: string) {
    const setting = await this.settingRepo.findOne({ where: { tenantId, key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return this.settingRepo.remove(setting);
  }
}
