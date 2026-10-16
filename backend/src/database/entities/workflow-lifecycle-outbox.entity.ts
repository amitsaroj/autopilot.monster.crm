import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type WorkflowLifecycleEventName =
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed';
export type WorkflowLifecycleOutboxStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED';

@Entity('workflow_lifecycle_outbox')
@Index('UQ_workflow_lifecycle_outbox_event', ['tenantId', 'executionId', 'eventId'], {
  unique: true,
})
@Index('IDX_workflow_lifecycle_outbox_due', ['status', 'nextAttemptAt', 'createdAt'])
export class WorkflowLifecycleOutbox {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'workflow_id', type: 'uuid' })
  workflowId!: string;

  @Column({ name: 'execution_id', type: 'uuid' })
  executionId!: string;

  @Column({ type: 'varchar', length: 64 })
  event!: WorkflowLifecycleEventName;

  @Column({ name: 'event_id', type: 'varchar', length: 255 })
  eventId!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 16, default: 'PENDING' })
  status!: WorkflowLifecycleOutboxStatus;

  @Column({ type: 'integer', default: 0 })
  attempts!: number;

  @Column({ name: 'next_attempt_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  nextAttemptAt!: Date;

  @Column({ name: 'lease_expires_at', type: 'timestamptz', nullable: true })
  leaseExpiresAt!: Date | null;

  @Column({ name: 'last_error', type: 'varchar', length: 80, nullable: true })
  lastError!: string | null;

  @Column({ name: 'dispatched_at', type: 'timestamptz', nullable: true })
  dispatchedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
