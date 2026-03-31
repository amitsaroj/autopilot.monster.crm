import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminEmailSettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'EMAIL' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      host: config['smtp_host'] || 'smtp.sendgrid.net',
      port: config['smtp_port'] || 587,
      user: config['smtp_user'] || 'apikey',
      password: config['smtp_password'] || '',
      fromEmail: config['from_email'] || 'noreply@autopilot.monster',
      fromName: config['from_name'] || 'Autopilot Monster',
      encryption: config['smtp_encryption'] || 'tls',
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      host: 'smtp_host',
      port: 'smtp_port',
      user: 'smtp_user',
      password: 'smtp_password',
      fromEmail: 'from_email',
      fromName: 'from_name',
      encryption: 'smtp_encryption',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'EMAIL' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }

  async sendTestEmail(to: string) {
    // This would use an internal MailerService
    return { success: true, timestamp: new Date(), recipient: to };
  }
}
