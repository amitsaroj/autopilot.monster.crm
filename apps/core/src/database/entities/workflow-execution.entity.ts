import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Flow } from './flow.entity';

@Entity('workflow_executions')
@Index(['tenantId', 'flowId'])
export class WorkflowExecution extends BaseEntity {
  @Column({ name: 'flow_id', type: 'uuid' })
  flowId!: string;

  @ManyToOne(() => Flow)
  @JoinColumn({ name: 'flow_id' })
  flow?: Flow;

  @Column({
    type: 'enum',
    enum: ['RUNNING', 'COMPLETED', 'FAILED', 'PAUSED'],
    default: 'RUNNING',
  })
  status!: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  input!: any;

  @Column({ type: 'jsonb', default: '{}' })
  output!: any;

  @Column({ name: 'current_step_id', nullable: true })
  currentStepId?: string;

  @Column({ type: 'text', nullable: true })
  error?: string;
}
