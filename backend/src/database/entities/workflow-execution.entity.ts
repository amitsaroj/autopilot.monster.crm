import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Flow } from './flow.entity';
import type { WorkflowStepResult } from '../../modules/workflow/workflow-executor.service';

export type WorkflowRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PAUSED'
  | 'CANCELLED';
export interface WorkflowRunOutput {
  steps: WorkflowStepResult[];
  variables?: Record<string, unknown>;
}

@Entity('workflow_executions')
@Index(['tenantId', 'flowId'])
@Index(['tenantId', 'flowId', 'eventId'], { unique: true })
export class WorkflowExecution extends BaseEntity {
  @Column({ name: 'flow_id', type: 'uuid' })
  flowId!: string;

  @ManyToOne(() => Flow)
  @JoinColumn({ name: 'flow_id' })
  flow?: Flow;

  @Column({ type: 'varchar', default: 'QUEUED' })
  status!: WorkflowRunStatus;

  @Column({ name: 'version_id', type: 'uuid', nullable: true })
  versionId?: string | null;

  @Column({ name: 'definition_snapshot', type: 'jsonb', nullable: true })
  definitionSnapshot?: Record<string, unknown> | null;

  @Column({ name: 'event_id', type: 'varchar', length: 200, nullable: true })
  eventId?: string | null;

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'jsonb', default: '{}' })
  input!: { eventName?: string; payload?: Record<string, unknown> };

  @Column({ type: 'jsonb', default: '{"steps":[]}' })
  output!: WorkflowRunOutput;

  /** Node ID, not an index in the editable definition. Null means execution finished. */
  @Column({ name: 'current_step_id', type: 'varchar', nullable: true })
  currentStepId?: string | null;

  @Column({ name: 'resume_at', type: 'timestamptz', nullable: true })
  resumeAt?: Date | null;

  @Column({ name: 'pause_reason', type: 'varchar', nullable: true })
  pauseReason?: string | null;

  @Column({ name: 'dispatch_generation', type: 'integer', default: 0 })
  dispatchGeneration!: number;

  @Column({ name: 'lease_token', type: 'uuid', nullable: true })
  leaseToken?: string | null;

  @Column({ name: 'lease_expires_at', type: 'timestamptz', nullable: true })
  leaseExpiresAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  error?: string | null;
}
