import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from '../../database/entities/feature-flag.entity';
import { CreateFeatureFlagDto } from './dto/tenant-features.dto';

@Injectable()
export class FeatureFlagService {

  constructor(
    @InjectRepository(FeatureFlag)
    private readonly flagRepo: Repository<FeatureFlag>,
  ) {}

  async create(tenantId: string, dto: CreateFeatureFlagDto): Promise<FeatureFlag> {
    const flag = this.flagRepo.create({
      tenantId,
      key: dto.key,
      name: dto.name,
      description: dto.description,
      allowedPlans: dto.allowedPlans || [],
      rolloutPercentage: dto.rolloutPercentage ?? 100,
      enabled: false,
    });
    return this.flagRepo.save(flag);
  }

  async findAll(tenantId: string): Promise<FeatureFlag[]> {
    return this.flagRepo.find({
      where: { tenantId } as any,
      order: { key: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<FeatureFlag> {
    const flag = await this.flagRepo.findOne({ where: { id, tenantId } as any });
    if (!flag) throw new NotFoundException('Feature flag not found');
    return flag;
  }

  /** Check if a feature is enabled for a given tenant + plan */
  async isEnabled(tenantId: string, featureKey: string, planSlug?: string): Promise<boolean> {
    const flag = await this.flagRepo.findOne({
      where: { tenantId, key: featureKey } as any,
    });
    if (!flag || !flag.enabled) return false;
    if (flag.allowedPlans.length > 0 && planSlug && !flag.allowedPlans.includes(planSlug)) {
      return false;
    }
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashTenantFeature(tenantId, featureKey);
      return (hash % 100) < flag.rolloutPercentage;
    }
    return true;
  }

  async toggle(tenantId: string, id: string): Promise<FeatureFlag> {
    const flag = await this.findOne(tenantId, id);
    flag.enabled = !flag.enabled;
    return this.flagRepo.save(flag);
  }

  async update(tenantId: string, id: string, dto: Partial<CreateFeatureFlagDto>): Promise<FeatureFlag> {
    const flag = await this.findOne(tenantId, id);
    Object.assign(flag, dto);
    return this.flagRepo.save(flag);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const flag = await this.findOne(tenantId, id);
    await this.flagRepo.softRemove(flag);
  }

  private hashTenantFeature(tenantId: string, featureKey: string): number {
    let hash = 0;
    const str = `${tenantId}:${featureKey}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
