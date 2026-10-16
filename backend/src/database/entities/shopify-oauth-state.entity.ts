import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('shopify_oauth_states')
@Index('UQ_shopify_oauth_states_hash', ['stateHash'], { unique: true })
@Index('IDX_shopify_oauth_states_expiry', ['expiresAt'])
export class ShopifyOAuthState extends BaseEntity {
  @Column({ name: 'shop_domain', type: 'varchar', length: 255 })
  shopDomain!: string;

  @Column({ name: 'state_hash', type: 'varchar', length: 64 })
  stateHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;
}
