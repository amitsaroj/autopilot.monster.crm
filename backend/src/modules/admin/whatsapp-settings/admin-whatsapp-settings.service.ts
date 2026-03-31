import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminWhatsAppSettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'WHATSAPP' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      appId: config['whatsapp_app_id'] || '',
      appSecret: config['whatsapp_app_secret'] || '',
      accessToken: config['whatsapp_access_token'] || '',
      phoneNumberId: config['whatsapp_phone_number_id'] || '',
      businessAccountId: config['whatsapp_business_id'] || '',
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      appId: 'whatsapp_app_id',
      appSecret: 'whatsapp_app_secret',
      accessToken: 'whatsapp_access_token',
      phoneNumberId: 'whatsapp_phone_number_id',
      businessAccountId: 'whatsapp_business_id',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'WHATSAPP' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
