import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminSecuritySettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'SECURITY' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      enforce2fa: config['security_enforce_2fa'] || false,
      sessionTimeout: config['security_session_timeout'] || 3600,
      passwordMinLength: config['security_password_min_length'] || 8,
      failedLoginLimit: config['security_failed_login_limit'] || 5,
      lockoutDuration: config['security_lockout_duration'] || 300,
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      enforce2fa: 'security_enforce_2fa',
      sessionTimeout: 'security_session_timeout',
      passwordMinLength: 'security_password_min_length',
      failedLoginLimit: 'security_failed_login_limit',
      lockoutDuration: 'security_lockout_duration',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'SECURITY' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
