import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  AnalyticsReport,
  AnalyticsReportStatus,
  AnalyticsReportType,
} from '../../database/entities/analytics-report.entity';
import { BaseRepository } from '../../database/base.repository';
import { AnalyticsService } from './analytics.service';
import {
  CreateAnalyticsReportDto,
  UpdateAnalyticsReportDto,
} from './dto/analytics-report.dto';

@Injectable()
export class AnalyticsReportRepository extends BaseRepository<AnalyticsReport> {
  constructor(@InjectRepository(AnalyticsReport) repo: Repository<AnalyticsReport>) {
    super(repo);
  }
}

@Injectable()
export class AnalyticsReportService {
  constructor(
    private readonly repository: AnalyticsReportRepository,
    private readonly analyticsService: AnalyticsService,
  ) {}

  findAll(tenantId: string): Promise<AnalyticsReport[]> {
    return this.repository.findAll(tenantId, { order: { updatedAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<AnalyticsReport> {
    const report = await this.repository.findById(tenantId, id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  create(tenantId: string, dto: CreateAnalyticsReportDto): Promise<AnalyticsReport> {
    return this.repository.create(tenantId, {
      name: dto.name,
      description: dto.description,
      reportType: dto.reportType ?? AnalyticsReportType.OVERVIEW,
      filters: dto.filters ?? {},
      schedule: dto.schedule,
      status: AnalyticsReportStatus.DRAFT,
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateAnalyticsReportDto,
  ): Promise<AnalyticsReport> {
    await this.findOne(tenantId, id);
    return this.repository.updateWithTenant(tenantId, id, dto);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.repository.delete(tenantId, id);
  }

  async run(tenantId: string, id: string): Promise<AnalyticsReport> {
    const report = await this.findOne(tenantId, id);

    await this.repository.updateWithTenant(tenantId, id, {
      status: AnalyticsReportStatus.RUNNING,
    });

    try {
      const results = await this.generateResults(tenantId, report.reportType);
      return this.repository.updateWithTenant(tenantId, id, {
        status: AnalyticsReportStatus.READY,
        lastRunAt: new Date(),
        lastResults: results,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Report execution failed';
      return this.repository.updateWithTenant(tenantId, id, {
        status: AnalyticsReportStatus.FAILED,
        lastResults: { error: message },
      });
    }
  }

  async getResults(tenantId: string, id: string): Promise<Record<string, unknown>> {
    const report = await this.findOne(tenantId, id);
    if (!report.lastResults) {
      return { message: 'No results yet. Run the report first.' };
    }
    return report.lastResults;
  }

  private async generateResults(
    tenantId: string,
    reportType: AnalyticsReportType,
  ): Promise<Record<string, unknown>> {
    switch (reportType) {
      case AnalyticsReportType.CRM:
        return this.analyticsService.getCrmAnalytics(tenantId);
      case AnalyticsReportType.REVENUE:
        return this.analyticsService.getRevenueAnalytics(tenantId);
      case AnalyticsReportType.PIPELINE:
        return { stages: await this.analyticsService.getPipelineAnalytics(tenantId) };
      case AnalyticsReportType.TEAM:
        return { members: await this.analyticsService.getTeamAnalytics(tenantId) };
      case AnalyticsReportType.VOICE:
        return this.analyticsService.getVoiceAnalytics(tenantId);
      case AnalyticsReportType.WHATSAPP:
        return this.analyticsService.getWhatsappAnalytics(tenantId);
      case AnalyticsReportType.OVERVIEW:
        return this.analyticsService.getOverview(tenantId);
      default: {
        const exhaustive: never = reportType;
        return exhaustive;
      }
    }
  }
}
