import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminSystemSettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'SYSTEM' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    // Defaults if empty
    return {
      platformName: config['platform_name'] || 'Autopilot Monster',
      maintenanceMode: config['maintenance_mode'] || false,
      allowRegistration: config['allow_registration'] !== undefined ? config['allow_registration'] : true,
      contactEmail: config['contact_email'] || 'admin@autopilot.monster',
      logoUrl: config['logo_url'] || '',
      ...config
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const promises = Object.entries(settings).map(async ([key, value]) => {
      let setting = await this.settingRepo.findOne({ where: { key } });
      if (!setting) {
        setting = this.settingRepo.create({ key, value, group: 'SYSTEM' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
