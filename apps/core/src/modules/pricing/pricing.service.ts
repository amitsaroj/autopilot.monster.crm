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

  // --- Management (SuperAdmin) ---

  async createPlan(data: any) {
    return this.pricingRepository.createPlan(data);
  }

  async updatePlan(id: string, data: any) {
    return this.pricingRepository.updatePlan(id, data);
  }

  async deletePlan(id: string) {
    return this.pricingRepository.deletePlan(id);
  }

  async addFeatureToPlan(data: any) {
    return this.pricingRepository.createFeature(data);
  }

  async updatePlanFeature(id: string, data: any) {
    return this.pricingRepository.updateFeature(id, data);
  }

  async removeFeatureFromPlan(id: string) {
    return this.pricingRepository.deleteFeature(id);
  }

  async addLimitToPlan(data: any) {
    return this.pricingRepository.createLimit(data);
  }

  async updatePlanLimit(id: string, data: any) {
    return this.pricingRepository.updateLimit(id, data);
  }

  async removeLimitFromPlan(id: string) {
    return this.pricingRepository.deleteLimit(id);
  }
}
