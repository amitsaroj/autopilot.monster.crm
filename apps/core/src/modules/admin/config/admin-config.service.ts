import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminConfigService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async findAll() {
    return this.settingRepo.find();
  }

  async update(data: { key: string; value: any; group?: string; isPublic?: boolean }) {
    let setting = await this.settingRepo.findOne({ where: { key: data.key } });
    if (!setting) {
      setting = this.settingRepo.create(data);
    } else {
      Object.assign(setting, data);
    }
    return this.settingRepo.save(setting);
  }

  async remove(key: string) {
    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return this.settingRepo.remove(setting);
  }
}
