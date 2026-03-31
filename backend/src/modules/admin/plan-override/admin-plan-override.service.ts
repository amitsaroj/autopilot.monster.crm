import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminPlanOverrideService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const setting = await this.settingRepo.findOne({ where: { key: 'global_plan_overrides' } });
    if (!setting) return {};
    return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
  }

  async updateSettings(overrides: any) {
    let setting = await this.settingRepo.findOne({ where: { key: 'global_plan_overrides' } });
    if (!setting) {
      setting = this.settingRepo.create({ key: 'global_plan_overrides', group: 'PLANNING' });
    }
    setting.value = overrides;
    return this.settingRepo.save(setting);
  }
}
