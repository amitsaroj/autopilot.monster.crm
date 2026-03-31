import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';

@Injectable()
export class SubAdminAiService {
  constructor(
    @InjectRepository(TenantSetting) private readonly configRepo: Repository<TenantSetting>,
  ) {}

  async findConfigs(tenantId: string) {
    return this.configRepo.find({ where: { tenantId, group: 'AI' } });
  }

  async updateConfig(tenantId: string, dto: any) {
    let config: any = await this.configRepo.findOne({ where: { tenantId, key: dto.key } });
    if (config) {
      config.value = dto.value;
    } else {
      config = this.configRepo.create({ ...dto, tenantId, group: 'AI' });
    }
    return this.configRepo.save(config);
  }
}
