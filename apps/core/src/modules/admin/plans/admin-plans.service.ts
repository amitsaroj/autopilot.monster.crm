import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '@autopilot/core/database/entities/plan.entity';

@Injectable()
export class AdminPlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async findAll() {
    return this.planRepo.find({
      relations: ['features', 'limits'],
      order: { priceMonthly: 'ASC' },
    });
  }

  async findOne(id: string) {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['features', 'limits'],
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(data: any) {
    const plan = this.planRepo.create(data);
    return this.planRepo.save(plan);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.planRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const plan = await this.findOne(id);
    return this.planRepo.remove(plan);
  }
}
