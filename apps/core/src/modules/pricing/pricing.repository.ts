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
}
