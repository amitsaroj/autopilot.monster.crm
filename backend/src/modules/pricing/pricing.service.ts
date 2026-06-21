import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingRepository } from './pricing.repository';
import { Tenant } from '../../database/entities/tenant.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import type { UsagePeriod } from '../billing/usage-period.util';

@Injectable()
export class PricingService {
  constructor(
    private readonly pricingRepository: PricingRepository,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async getTenantSubscription(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: { tenantId, status: 'ACTIVE' } as any,
    });
  }

  async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    const override = tenant?.overrides?.features?.[featureKey];
    if (override !== undefined) {
      return override;
    }

    const sub = await this.getTenantSubscription(tenantId);
    if (!sub) return false;

    const features = await this.pricingRepository.findPlanFeatures(sub.planId);
    const feature = features.find((f) => f.featureKey === featureKey);
    return feature ? feature.enabled : false;
  }

  async getLimit(tenantId: string, metric: string): Promise<number> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    const override = tenant?.overrides?.limits?.[metric];
    if (override !== undefined) {
      return Number(override);
    }

    const sub = await this.getTenantSubscription(tenantId);
    if (!sub) return 0;

    const limits = await this.pricingRepository.findPlanLimits(sub.planId);
    const limit = limits.find((l) => l.metric === metric);
    return limit ? Number(limit.value) : 0;
  }

  async getLimitPeriod(tenantId: string, metric: string): Promise<UsagePeriod> {
    const sub = await this.getTenantSubscription(tenantId);
    if (!sub) return 'MONTHLY';

    const limits = await this.pricingRepository.findPlanLimits(sub.planId);
    const limit = limits.find((l) => l.metric === metric);
    return limit?.period ?? 'MONTHLY';
  }

  async getEnabledFeatures(tenantId: string): Promise<Record<string, boolean>> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    const overrides = tenant?.overrides?.features ?? {};

    const sub = await this.getTenantSubscription(tenantId);
    if (!sub) {
      return { ...overrides };
    }

    const features = await this.pricingRepository.findPlanFeatures(sub.planId);
    const planFeatures = features.reduce<Record<string, boolean>>((acc, feature) => {
      acc[feature.featureKey] = feature.enabled;
      return acc;
    }, {});

    return { ...planFeatures, ...overrides };
  }

  async getAllLimits(tenantId: string): Promise<Record<string, number>> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    const overrides = tenant?.overrides?.limits ?? {};

    const sub = await this.getTenantSubscription(tenantId);
    if (!sub) {
      return Object.fromEntries(
        Object.entries(overrides).map(([metric, value]) => [metric, Number(value)]),
      );
    }

    const limits = await this.pricingRepository.findPlanLimits(sub.planId);
    const planLimits = limits.reduce<Record<string, number>>((acc, limit) => {
      acc[limit.metric] = Number(limit.value);
      return acc;
    }, {});

    return {
      ...planLimits,
      ...Object.fromEntries(
        Object.entries(overrides).map(([metric, value]) => [metric, Number(value)]),
      ),
    };
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
