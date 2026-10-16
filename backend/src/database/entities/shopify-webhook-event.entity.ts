import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export type ShopifyWebhookEventStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

@Entity('shopify_webhook_events')
@Index('UQ_shopify_webhook_events_delivery', ['tenantId', 'deliveryId'], { unique: true })
@Index('IDX_shopify_webhook_events_due', ['status', 'receivedAt'])
export class ShopifyWebhookEvent extends BaseEntity {
  @Column({ name: 'delivery_id', type: 'varchar', length: 255 })
  deliveryId!: string;

  @Column({ name: 'shop_domain', type: 'varchar', length: 255 })
  shopDomain!: string;

  @Column({ type: 'varchar', length: 100 })
  topic!: string;

  @Column({ name: 'event_name', type: 'varchar', length: 100 })
  eventName!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 16, default: 'RECEIVED' })
  status!: ShopifyWebhookEventStatus;

  @Column({ type: 'integer', default: 0 })
  attempts!: number;

  @Column({ name: 'received_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  receivedAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @Column({ name: 'last_error', type: 'varchar', length: 300, nullable: true })
  lastError!: string | null;
}
