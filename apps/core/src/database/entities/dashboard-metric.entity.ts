import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('dashboard_metrics')
@Index(['tenantId', 'metricName', 'period'])
export class DashboardMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'metric_name', length: 100 })
  metricName!: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  value!: number;

  @Column({ length: 20 })
  period!: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @Column({ name: 'captured_at', type: 'timestamptz' })
  capturedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
