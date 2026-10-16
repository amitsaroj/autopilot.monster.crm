import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('usage_records')
@Index(['tenantId', 'metric', 'periodStart', 'periodEnd'])
// Atomic usage upserts (ON CONFLICT) rely on this — see migration 1740000000026.
@Index('uq_usage_records_tenant_metric_period', ['tenantId', 'metric', 'periodStart'], {
  unique: true,
})
export class UsageRecord extends BaseEntity {
  @Column({ length: 100 })
  metric!: string; // e.g. 'ai_calls', 'whatsapp_messages'

  @Column({ type: 'bigint', default: 0 })
  quantity!: number;

  @Column({ name: 'period_start', type: 'timestamptz' })
  periodStart!: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  periodEnd!: Date;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 15, scale: 6, default: 0 })
  unitCost!: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCost!: number;

  @Column({ type: 'jsonb', default: '{}' })
  meta!: Record<string, any>;
}
