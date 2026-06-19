import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum DataJobType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  BACKUP = 'BACKUP',
}

export enum DataJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('data_jobs')
@Index(['tenantId', 'type', 'status'])
export class DataJob extends BaseEntity {
  @Column({ type: 'enum', enum: DataJobType })
  type!: DataJobType;

  @Column({ type: 'enum', enum: DataJobStatus, default: DataJobStatus.PENDING })
  status!: DataJobStatus;

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType?: string;

  @Column({ name: 'file_key', nullable: true })
  fileKey?: string;

  @Column({ name: 'download_url', type: 'text', nullable: true })
  downloadUrl?: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata!: Record<string, unknown>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
