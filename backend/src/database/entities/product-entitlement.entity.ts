import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Plugin } from './plugin.entity';

@Entity('product_entitlements')
@Index('IDX_product_entitlements_tenant_plugin', ['tenantId', 'pluginId'])
@Index('UQ_product_entitlements_checkout', ['checkoutSessionId'], { unique: true })
export class ProductEntitlement extends BaseEntity {
  @Column({ name: 'plugin_id', type: 'uuid' })
  pluginId!: string;

  @ManyToOne(() => Plugin)
  @JoinColumn({ name: 'plugin_id' })
  plugin?: Plugin;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';

  @Column({ type: 'varchar', length: 30, default: 'STRIPE' })
  source!: 'STRIPE';

  @Column({ name: 'stripe_price_id', type: 'varchar', length: 255 })
  stripePriceId!: string;

  @Column({ name: 'product_version', type: 'varchar', length: 50 })
  productVersion!: string;

  @Column({ name: 'checkout_session_id', type: 'varchar', length: 255, nullable: true })
  checkoutSessionId!: string | null;

  @Column({ name: 'stripe_subscription_id', type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId!: string | null;

  @Column({ name: 'payment_intent_id', type: 'varchar', length: 255, nullable: true })
  paymentIntentId!: string | null;

  @Column({ name: 'stripe_customer_id', type: 'varchar', length: 255, nullable: true })
  stripeCustomerId!: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'last_event_id', type: 'varchar', length: 255, nullable: true })
  lastEventId!: string | null;

  @Column({ name: 'last_event_created', type: 'bigint', default: 0 })
  lastEventCreated!: number;

  @Column({ name: 'revocation_reason', type: 'varchar', length: 50, nullable: true })
  revocationReason!: string | null;
}
