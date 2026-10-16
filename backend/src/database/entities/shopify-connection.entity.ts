import { Exclude } from 'class-transformer';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export type ShopifyConnectionStatus = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
export type ShopifyWebhookStatus = 'READY' | 'DEGRADED' | 'NOT_CONFIGURED';

@Entity('shopify_connections')
@Index('UQ_shopify_connections_shop_domain', ['shopDomain'], { unique: true })
@Index('IDX_shopify_connections_tenant_status', ['tenantId', 'status'])
export class ShopifyConnection extends BaseEntity {
  @Column({ name: 'shop_domain', type: 'varchar', length: 255 })
  shopDomain!: string;

  @Column({ type: 'varchar', length: 20, default: 'CONNECTED' })
  status!: ShopifyConnectionStatus;

  @Exclude()
  @Column({ name: 'encrypted_access_token', type: 'text', select: false })
  encryptedAccessToken!: string;

  @Exclude()
  @Column({ name: 'encrypted_refresh_token', type: 'text', nullable: true, select: false })
  encryptedRefreshToken!: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  scopes!: string[];

  @Column({ name: 'access_token_expires_at', type: 'timestamptz', nullable: true })
  accessTokenExpiresAt!: Date | null;

  @Column({ name: 'refresh_token_expires_at', type: 'timestamptz', nullable: true })
  refreshTokenExpiresAt!: Date | null;

  @Column({ name: 'webhook_status', type: 'varchar', length: 24, default: 'NOT_CONFIGURED' })
  webhookStatus!: ShopifyWebhookStatus;

  @Column({ name: 'webhook_subscription_ids', type: 'text', array: true, default: '{}' })
  webhookSubscriptionIds!: string[];

  @Column({ name: 'last_error', type: 'varchar', length: 500, nullable: true })
  lastError!: string | null;

  @Column({ name: 'connected_at', type: 'timestamptz', nullable: true })
  connectedAt!: Date | null;

  @Column({ name: 'disconnected_at', type: 'timestamptz', nullable: true })
  disconnectedAt!: Date | null;
}
