import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '@autopilot/core/database/entities/platform-setting.entity';
import { Tenant } from '@autopilot/core/database/entities/tenant.entity';

@Injectable()
export class AdminFeatureFlagsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async getGlobalFlags() {
    return this.settingRepo.find({
      where: { group: 'FEATURE_FLAGS' },
    });
  }

  async updateGlobalFlag(key: string, enabled: boolean) {
    let flag = await this.settingRepo.findOne({ where: { key, group: 'FEATURE_FLAGS' } });
    if (!flag) {
      flag = this.settingRepo.create({ key, value: enabled, group: 'FEATURE_FLAGS', isPublic: true });
    } else {
      flag.value = enabled;
    }
    return this.settingRepo.save(flag);
  }

  async getTenantFlags(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant.overrides?.features || {};
  }

  async updateTenantFlag(tenantId: string, key: string, enabled: boolean) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (!tenant.overrides) tenant.overrides = {};
    if (!tenant.overrides.features) tenant.overrides.features = {};

    tenant.overrides.features[key] = enabled;
    return this.tenantRepo.save(tenant);
  }
}
