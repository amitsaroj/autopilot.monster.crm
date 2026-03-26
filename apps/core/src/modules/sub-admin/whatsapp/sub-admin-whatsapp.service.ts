import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';

@Injectable()
export class SubAdminWhatsappService {
  constructor(
    @InjectRepository(TenantSetting) private readonly configRepo: Repository<TenantSetting>,
  ) {}

  async findProfiles(tenantId: string) {
    return this.configRepo.find({ where: { tenantId, group: 'WHATSAPP' } });
  }

  async linkProfile(tenantId: string, dto: any) {
    let config: any = await this.configRepo.findOne({ where: { tenantId, key: dto.key } });
    if (config) {
      config.value = dto.value;
    } else {
      config = this.configRepo.create({ ...dto, tenantId, group: 'WHATSAPP' });
    }
    return this.configRepo.save(config);
  }
}
