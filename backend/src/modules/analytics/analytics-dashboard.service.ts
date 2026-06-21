import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnalyticsDashboard } from '../../database/entities/analytics-dashboard.entity';
import { BaseRepository } from '../../database/base.repository';
import {
  CreateAnalyticsDashboardDto,
  UpdateAnalyticsDashboardDto,
} from './dto/analytics-dashboard.dto';

@Injectable()
export class AnalyticsDashboardRepository extends BaseRepository<AnalyticsDashboard> {
  constructor(@InjectRepository(AnalyticsDashboard) repo: Repository<AnalyticsDashboard>) {
    super(repo);
  }
}

@Injectable()
export class AnalyticsDashboardService {
  constructor(private readonly repository: AnalyticsDashboardRepository) {}

  findAll(tenantId: string): Promise<AnalyticsDashboard[]> {
    return this.repository.findAll(tenantId, { order: { updatedAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<AnalyticsDashboard> {
    const dashboard = await this.repository.findById(tenantId, id);
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async create(tenantId: string, dto: CreateAnalyticsDashboardDto): Promise<AnalyticsDashboard> {
    if (dto.isDefault) {
      await this.clearDefault(tenantId);
    }

    return this.repository.create(tenantId, {
      name: dto.name,
      description: dto.description,
      widgets: dto.widgets ?? [],
      isDefault: dto.isDefault ?? false,
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateAnalyticsDashboardDto,
  ): Promise<AnalyticsDashboard> {
    await this.findOne(tenantId, id);

    if (dto.isDefault) {
      await this.clearDefault(tenantId);
    }

    return this.repository.updateWithTenant(tenantId, id, dto);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.repository.delete(tenantId, id);
  }

  private async clearDefault(tenantId: string): Promise<void> {
    const dashboards = await this.repository.findAll(tenantId);
    for (const dashboard of dashboards) {
      if (dashboard.isDefault) {
        await this.repository.updateWithTenant(tenantId, dashboard.id, { isDefault: false });
      }
    }
  }
}
