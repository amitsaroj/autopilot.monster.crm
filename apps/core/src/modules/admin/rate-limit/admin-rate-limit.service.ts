import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminRateLimitService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'RATE_LIMIT' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      globalTtl: config['rl_global_ttl'] || 60,
      globalLimit: config['rl_global_limit'] || 100,
      authLimit: config['rl_auth_limit'] || 10,
      apiLimit: config['rl_api_limit'] || 1000,
      webhookLimit: config['rl_webhook_limit'] || 500,
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      globalTtl: 'rl_global_ttl',
      globalLimit: 'rl_global_limit',
      authLimit: 'rl_auth_limit',
      apiLimit: 'rl_api_limit',
      webhookLimit: 'rl_webhook_limit',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'RATE_LIMIT' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
