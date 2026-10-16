import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('whatsapp_messages')
@Index(['tenantId', 'messageSid'])
@Index(['tenantId', 'idempotencyKey'], { unique: true })
@Index(['tenantId', 'phoneNumberId', 'createdAt'])
export class WhatsAppMessage extends BaseEntity {
  @Column({ name: 'message_sid', unique: true })
  messageSid!: string;

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({
    type: 'enum',
    enum: ['INBOUND', 'OUTBOUND'],
  })
  direction!: 'INBOUND' | 'OUTBOUND';

  @Column({ default: 'SENT' })
  status!: string;

  @Column({ name: 'phone_number_id', nullable: true })
  phoneNumberId?: string;

  @Column({ name: 'idempotency_key', length: 200, nullable: true })
  idempotencyKey?: string;

  @Column({ name: 'request_hash', length: 64, nullable: true })
  requestHash?: string;

  @Column({ name: 'provider_timestamp', type: 'timestamptz', nullable: true })
  providerTimestamp?: Date;

  @Column({ name: 'workflow_dispatched', default: false })
  workflowDispatched!: boolean;

  @Column({ name: 'retry_allowed', default: false })
  retryAllowed!: boolean;

  @Column({ name: 'error_reason', type: 'text', nullable: true })
  errorReason?: string;

  @Column({ name: 'broadcast_id', type: 'uuid', nullable: true })
  broadcastId?: string;

  @Column({ name: 'media_urls', type: 'text', array: true, default: '{}' })
  mediaUrls!: string[];

  /** Meta `pricing` from status webhooks (migration 021). */
  @Column({ name: 'pricing_billable', type: 'boolean', nullable: true })
  pricingBillable?: boolean | null;

  @Column({ name: 'pricing_category', type: 'varchar', length: 64, nullable: true })
  pricingCategory?: string | null;

  @Column({ name: 'pricing_model', type: 'varchar', length: 64, nullable: true })
  pricingModel?: string | null;
}
