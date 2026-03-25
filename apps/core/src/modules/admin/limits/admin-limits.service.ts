import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanLimit } from '@autopilot/core/database/entities/plan-limit.entity';

@Injectable()
export class AdminLimitsService {
  constructor(
    @InjectRepository(PlanLimit)
    private readonly limitRepo: Repository<PlanLimit>,
  ) {}

  async findAll() {
    return this.limitRepo.find({
      relations: ['plan'],
      order: { planId: 'ASC', metric: 'ASC' },
    });
  }

  async findOne(id: string) {
    const limit = await this.limitRepo.findOne({
      where: { id },
      relations: ['plan'],
    });
    if (!limit) throw new NotFoundException('Limit not found');
    return limit;
  }

  async create(data: any) {
    const limit = this.limitRepo.create(data);
    return this.limitRepo.save(limit);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.limitRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const limit = await this.findOne(id);
    return this.limitRepo.remove(limit);
  }
}
