import { Injectable } from '@nestjs/common';
import { PricingRepository } from './pricing.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../database/entities/subscription.entity';

@Injectable()
export class PricingService {
  constructor(
    private readonly pricingRepository: PricingRepository,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async getTenantSubscription(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: { tenantId, status: 'ACTIVE' } as any,
    });
  }

  async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    const sub = await this.getTenantSubscription(tenantId);
    if (!sub) return false;

    const features = await this.pricingRepository.findPlanFeatures(sub.planId);
    const feature = features.find((f) => f.featureKey === featureKey);
    return feature ? feature.enabled : false;
  }

  async getLimit(tenantId: string, metric: string): Promise<number> {
    const sub = await this.getTenantSubscription(tenantId);
    if (!sub) return 0;

    const limits = await this.pricingRepository.findPlanLimits(sub.planId);
    const limit = limits.find((l) => l.metric === metric);
    return limit ? Number(limit.value) : 0;
  }

  async findAllPlans() {
    return this.pricingRepository.findAllPlans();
  }
}
