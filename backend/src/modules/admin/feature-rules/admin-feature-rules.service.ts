import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminFeatureRulesService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'FEATURE_RULES' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      enableAiAgents: config['fr_enable_ai'] ?? true,
      enableBulkSms: config['fr_enable_sms'] ?? true,
      enableLiveCalls: config['fr_enable_voice'] ?? true,
      enableBetaFeatures: config['fr_enable_beta'] ?? false,
      maintenanceMessage: config['fr_maintenance_msg'] || 'System under routine maintenance.',
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      enableAiAgents: 'fr_enable_ai',
      enableBulkSms: 'fr_enable_sms',
      enableLiveCalls: 'fr_enable_voice',
      enableBetaFeatures: 'fr_enable_beta',
      maintenanceMessage: 'fr_maintenance_msg',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'FEATURE_RULES' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
