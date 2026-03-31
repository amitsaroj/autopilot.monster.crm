import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum JobStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  RUNNING = 'running',
  FAILED = 'failed',
}

@Entity('scheduled_jobs')
export class ScheduledJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  cron!: string;

  @Column()
  target!: string; // e.g., 'workflow:trigger' or 'email:digest'

  @Column({ type: 'jsonb', nullable: true })
  payload?: any;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.ENABLED })
  status!: JobStatus;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt?: Date;

  @Column({ name: 'next_run_at', type: 'timestamptz', nullable: true })
  nextRunAt?: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
