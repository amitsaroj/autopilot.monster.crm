import { Entity, Column } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum FineTuningStatus {
  PENDING = 'PENDING',
  TRAINING = 'TRAINING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('fine_tuning_jobs')
export class FineTuningJob extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'base_model', length: 100 })
  baseModel!: string;

  @Column({ name: 'fine_tuned_model', length: 100, nullable: true })
  fineTunedModel?: string;

  @Column({ type: 'enum', enum: FineTuningStatus, default: FineTuningStatus.PENDING })
  status!: FineTuningStatus;

  @Column({ name: 'dataset_file_key', nullable: true })
  datasetFileKey?: string;

  @Column({ name: 'openai_job_id', length: 100, nullable: true })
  openaiJobId?: string;

  @Column({ type: 'jsonb', default: '{}' })
  hyperparameters!: Record<string, unknown>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
