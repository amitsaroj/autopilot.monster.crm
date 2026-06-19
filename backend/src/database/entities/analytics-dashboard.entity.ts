import { Entity, Column } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('analytics_dashboards')
export class AnalyticsDashboard extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: '[]' })
  widgets!: Array<Record<string, unknown>>;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;
}
