import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../../database/entities/plan.entity';
import { PlanFeature } from '../../database/entities/plan-feature.entity';
import { PlanLimit } from '../../database/entities/plan-limit.entity';

@Injectable()
export class PricingRepository {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    @InjectRepository(PlanFeature)
    private readonly featureRepo: Repository<PlanFeature>,
    @InjectRepository(PlanLimit)
    private readonly limitRepo: Repository<PlanLimit>,
  ) {}

  async findPlanBySlug(slug: string): Promise<Plan | null> {
    return this.planRepo.findOne({ where: { slug } });
  }

  async findPlanFeatures(planId: string): Promise<PlanFeature[]> {
    return this.featureRepo.find({ where: { planId } });
  }

  async findPlanLimits(planId: string): Promise<PlanLimit[]> {
    return this.limitRepo.find({ where: { planId } });
  }

  async findAllPlans(): Promise<Plan[]> {
    return this.planRepo.find({ where: { status: 'ACTIVE' }, order: { sortOrder: 'ASC' } });
  }

  // --- Management ---

  async createPlan(data: Partial<Plan>): Promise<Plan> {
    const plan = this.planRepo.create(data);
    return this.planRepo.save(plan);
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    await this.planRepo.update(id, data);
    return this.planRepo.findOneBy({ id }) as any;
  }

  async deletePlan(id: string): Promise<void> {
    await this.planRepo.delete(id);
  }

  async createFeature(data: Partial<PlanFeature>): Promise<PlanFeature> {
    const feature = this.featureRepo.create(data);
    return this.featureRepo.save(feature);
  }

  async updateFeature(id: string, data: Partial<PlanFeature>): Promise<PlanFeature> {
    await this.featureRepo.update(id, data);
    return this.featureRepo.findOneBy({ id }) as any;
  }

  async deleteFeature(id: string): Promise<void> {
    await this.featureRepo.delete(id);
  }

  async createLimit(data: Partial<PlanLimit>): Promise<PlanLimit> {
    const limit = this.limitRepo.create(data);
    return this.limitRepo.save(limit);
  }

  async updateLimit(id: string, data: Partial<PlanLimit>): Promise<PlanLimit> {
    await this.limitRepo.update(id, data);
    return this.limitRepo.findOneBy({ id }) as any;
  }

  async deleteLimit(id: string): Promise<void> {
    await this.limitRepo.delete(id);
  }
}
