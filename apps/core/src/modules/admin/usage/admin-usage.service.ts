import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageRecord } from '@autopilot/core/database/entities/usage-record.entity';

@Injectable()
export class AdminUsageService {
  constructor(
    @InjectRepository(UsageRecord)
    private readonly usageRepo: Repository<UsageRecord>,
  ) {}

  async findAll(options: { tenantId?: string; metric?: string }) {
    const where: any = {};
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.metric) where.metric = options.metric;

    return this.usageRepo.find({
      where,
      order: { periodEnd: 'DESC' },
      take: 100,
    });
  }

  async getSummary() {
    return this.usageRepo
      .createQueryBuilder('usage')
      .select('usage.metric', 'metric')
      .addSelect('SUM(CAST(usage.quantity AS BIGINT))', 'totalQuantity')
      .addSelect('SUM(usage.totalCost)', 'totalCost')
      .groupBy('usage.metric')
      .getRawMany();
  }
}
