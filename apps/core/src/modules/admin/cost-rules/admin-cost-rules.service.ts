import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminCostRulesService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'COST_RULES' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      aiMarkup: config['cost_ai_markup'] || 20,
      smsMarkup: config['cost_sms_markup'] || 15,
      voiceMarkup: config['cost_voice_markup'] || 25,
      storageMarkup: config['cost_storage_markup'] || 10,
      minimumBalance: config['cost_min_balance'] || 5.00,
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      aiMarkup: 'cost_ai_markup',
      smsMarkup: 'cost_sms_markup',
      voiceMarkup: 'cost_voice_markup',
      storageMarkup: 'cost_storage_markup',
      minimumBalance: 'cost_min_balance',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'COST_RULES' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
