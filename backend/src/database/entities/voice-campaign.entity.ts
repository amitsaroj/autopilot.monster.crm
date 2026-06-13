import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('voice_campaigns')
@Index(['tenantId', 'status'])
export class VoiceCampaign extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status!: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId?: string;

  /** IDs of contacts/leads to call */
  @Column({ name: 'target_list', type: 'jsonb', default: '[]' })
  targetList!: string[];

  @Column({ name: 'total_calls', type: 'int', default: 0 })
  totalCalls!: number;

  @Column({ name: 'completed_calls', type: 'int', default: 0 })
  completedCalls!: number;

  @Column({ name: 'successful_calls', type: 'int', default: 0 })
  successfulCalls!: number;

  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries!: number;

  @Column({ name: 'retry_interval_minutes', type: 'int', default: 60 })
  retryIntervalMinutes!: number;

  @Column({ name: 'calls_per_minute', type: 'int', default: 5 })
  callsPerMinute!: number;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt?: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;
}
