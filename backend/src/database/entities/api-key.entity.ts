import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('api_keys')
@Index(['tenantId', 'keyHash'], { unique: true })
export class ApiKey extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  /** Only stored hashed — never store raw key */
  @Column({ name: 'key_hash', length: 128 })
  keyHash!: string;

  /** Prefix for display, e.g. "sk_live_abc..." */
  @Column({ name: 'key_prefix', length: 12 })
  keyPrefix!: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
    default: 'ACTIVE',
  })
  status!: 'ACTIVE' | 'REVOKED' | 'EXPIRED';

  /** JSON array of allowed scopes, e.g. ["contacts:read","deals:write"] */
  @Column({ type: 'jsonb', default: '["*"]' })
  scopes!: string[];

  @Column({ name: 'rate_limit', type: 'int', default: 1000 })
  rateLimit!: number;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
