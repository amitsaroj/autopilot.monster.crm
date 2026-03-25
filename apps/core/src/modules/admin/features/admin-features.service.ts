import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanFeature } from '@autopilot/core/database/entities/plan-feature.entity';

@Injectable()
export class AdminFeaturesService {
  constructor(
    @InjectRepository(PlanFeature)
    private readonly featureRepo: Repository<PlanFeature>,
  ) {}

  async findAll() {
    return this.featureRepo.find({
      relations: ['plan'],
      order: { planId: 'ASC', featureKey: 'ASC' },
    });
  }

  async findOne(id: string) {
    const feature = await this.featureRepo.findOne({
      where: { id },
      relations: ['plan'],
    });
    if (!feature) throw new NotFoundException('Feature not found');
    return feature;
  }

  async create(data: any) {
    const feature = this.featureRepo.create(data);
    return this.featureRepo.save(feature);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.featureRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const feature = await this.findOne(id);
    return this.featureRepo.remove(feature);
  }
}
