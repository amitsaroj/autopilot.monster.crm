import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardMetric } from '../../database/entities/dashboard-metric.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(DashboardMetric)
    private readonly metricRepo: Repository<DashboardMetric>,
  ) {}

  async getMetrics(tenantId: string, metricName: string, period: string) {
    return this.metricRepo.find({
      where: { tenantId, metricName, period } as any,
      order: { capturedAt: 'DESC' },
      take: 30,
    });
  }

  async captureMetric(
    tenantId: string,
    name: string,
    value: number,
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY',
  ) {
    const metric = this.metricRepo.create({
      tenantId,
      metricName: name,
      value,
      period,
      capturedAt: new Date(),
    } as any);
    return this.metricRepo.save(metric);
  }
}
