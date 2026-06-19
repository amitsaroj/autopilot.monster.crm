import { Entity, Column } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum AnalyticsReportType {
  OVERVIEW = 'OVERVIEW',
  CRM = 'CRM',
  REVENUE = 'REVENUE',
  PIPELINE = 'PIPELINE',
  TEAM = 'TEAM',
  VOICE = 'VOICE',
  WHATSAPP = 'WHATSAPP',
  AI = 'AI',
  FORECAST = 'FORECAST',
}

export enum AnalyticsReportStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
}

@Entity('analytics_reports')
export class AnalyticsReport extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'report_type', type: 'varchar', length: 50, default: AnalyticsReportType.OVERVIEW })
  reportType!: AnalyticsReportType;

  @Column({ type: 'jsonb', default: '{}' })
  filters!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  schedule?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: AnalyticsReportStatus,
    default: AnalyticsReportStatus.DRAFT,
  })
  status!: AnalyticsReportStatus;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt?: Date;

  @Column({ name: 'last_results', type: 'jsonb', nullable: true })
  lastResults?: Record<string, unknown>;
}
