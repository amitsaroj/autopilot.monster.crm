import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('webhook_deliveries')
@Index(['tenantId', 'webhookId', 'createdAt'])
export class WebhookDelivery extends BaseEntity {
  @Column({ name: 'webhook_id', type: 'uuid' })
  webhookId!: string;

  @Column({ name: 'replay_of', type: 'uuid', nullable: true })
  replayOf?: string;

  @Column({ name: 'replay_request_key', length: 200, nullable: true })
  replayRequestKey?: string;

  @Column({ length: 100 })
  event!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ name: 'response_status', type: 'int', nullable: true })
  responseStatus?: number;

  @Column({ name: 'response_body', type: 'text', nullable: true })
  responseBody?: string;

  @Column({ type: 'boolean', default: false })
  success!: boolean;

  @Column({ name: 'attempts', type: 'int', default: 1 })
  attempts!: number;

  @Column({ name: 'next_retry_at', type: 'timestamptz', nullable: true })
  nextRetryAt?: Date;
}
