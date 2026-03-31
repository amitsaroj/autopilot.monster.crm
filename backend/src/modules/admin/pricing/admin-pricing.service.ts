import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '@autopilot/core/database/entities/platform-setting.entity';

@Injectable()
export class AdminPricingService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    return this.settingRepo.find({
      where: { group: 'PRICING' },
    });
  }

  async updateSettings(settings: Record<string, any>) {
    const promises = Object.entries(settings).map(async ([key, value]) => {
      let setting = await this.settingRepo.findOne({ where: { key } });
      if (setting) {
        setting.value = value;
      } else {
        setting = this.settingRepo.create({ key, value, group: 'PRICING' });
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
