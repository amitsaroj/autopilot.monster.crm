import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminUsageRulesService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'USAGE_RULES' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      softLimitThreshold: config['usage_soft_limit'] || 80,
      hardLimitThreshold: config['usage_hard_limit'] || 100,
      autoDisableOnHardLimit: config['usage_auto_disable'] || false,
      gracePeriodDays: config['usage_grace_period'] || 3,
      notifyOnThreshold: config['usage_notify_on'] || 75,
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      softLimitThreshold: 'usage_soft_limit',
      hardLimitThreshold: 'usage_hard_limit',
      autoDisableOnHardLimit: 'usage_auto_disable',
      gracePeriodDays: 'usage_grace_period',
      notifyOnThreshold: 'usage_notify_on',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'USAGE_RULES' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
