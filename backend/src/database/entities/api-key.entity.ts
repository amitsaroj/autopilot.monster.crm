import { Entity, Column } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('api_keys')
export class ApiKey extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'key_prefix', length: 20 })
  keyPrefix!: string;

  @Column({ name: 'key_hash' })
  keyHash!: string;

  @Column({ type: 'text', array: true, default: '{}' })
  permissions!: string[];

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;
}
