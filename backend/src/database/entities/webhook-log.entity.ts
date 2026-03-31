import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('webhook_logs')
@Index(['tenantId', 'webhookId', 'event'])
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'webhook_id', type: 'uuid', nullable: true })
  webhookId?: string;

  @Column({ length: 100 })
  event!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ name: 'status_code', type: 'integer', nullable: true })
  statusCode?: number;

  @Column({ type: 'jsonb', nullable: true })
  payload?: any;

  @Column({ type: 'jsonb', nullable: true })
  response?: any;

  @Column({ name: 'duration_ms', type: 'integer', nullable: true })
  durationMs?: number;

  @Column({ default: 'PENDING' })
  status!: 'PENDING' | 'SUCCESS' | 'FAILED';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
