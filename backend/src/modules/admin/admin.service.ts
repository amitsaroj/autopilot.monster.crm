import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingsRepo: Repository<PlatformSetting>,
  ) {}

  async getSetting(key: string) {
    return this.settingsRepo.findOne({ where: { key } });
  }

  async updateSetting(key: string, value: any, group = 'GENERAL') {
    let setting = await this.getSetting(key);
    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingsRepo.create({ key, value, group });
    }
    return this.settingsRepo.save(setting);
  }

  async getAllSettings() {
    return this.settingsRepo.find();
  }
}
