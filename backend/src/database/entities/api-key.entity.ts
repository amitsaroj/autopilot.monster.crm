import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('api_keys')
@Index(['tenantId', 'keyHash'], { unique: true })
export class ApiKey extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'key_prefix', length: 20 })
  keyPrefix!: string;

  @Column({ name: 'key_hash' })
  keyHash!: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
    default: 'ACTIVE',
  })
  status!: 'ACTIVE' | 'REVOKED' | 'EXPIRED';

  @Column({ type: 'jsonb', default: '["*"]' })
  scopes!: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  permissions!: string[];

  @Column({ name: 'rate_limit', type: 'int', default: 1000 })
  rateLimit!: number;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
