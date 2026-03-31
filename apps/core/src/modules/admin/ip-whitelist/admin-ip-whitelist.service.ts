import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminIpWhitelistService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getWhitelist() {
    const setting = await this.settingRepo.findOne({ where: { key: 'ip_whitelist' } });
    if (!setting) return [];
    return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
  }

  async addIp(ip: string, description?: string) {
    let setting = await this.settingRepo.findOne({ where: { key: 'ip_whitelist' } });
    let whitelist = [];
    if (setting) {
      whitelist = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } else {
      setting = this.settingRepo.create({ key: 'ip_whitelist', group: 'SECURITY' });
    }
    
    if (!whitelist.find((item: any) => item.ip === ip)) {
      whitelist.push({ ip, description, addedAt: new Date() });
    }
    
    setting.value = whitelist;
    return this.settingRepo.save(setting);
  }

  async removeIp(ip: string) {
    const setting = await this.settingRepo.findOne({ where: { key: 'ip_whitelist' } });
    if (!setting) return;
    
    let whitelist = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    whitelist = whitelist.filter((item: any) => item.ip !== ip);
    
    setting.value = whitelist;
    return this.settingRepo.save(setting);
  }
}
