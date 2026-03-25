import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '@autopilot/core/database/entities/subscription.entity';

@Injectable()
export class AdminSubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async findAll(options: { tenantId?: string; status?: string }) {
    const where: any = {};
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.status) where.status = options.status;

    return this.subscriptionRepo.find({
      where,
      relations: ['tenant', 'plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const sub = await this.subscriptionRepo.findOne({
      where: { id },
      relations: ['tenant', 'plan'],
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.subscriptionRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const sub = await this.findOne(id);
    return this.subscriptionRepo.remove(sub);
  }
}
