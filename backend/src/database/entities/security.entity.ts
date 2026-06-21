import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ip_whitelists')
@Index(['tenantId'])
export class IpWhitelist extends BaseEntity {
  @Column({ name: 'ip_address', length: 45 })
  ipAddress!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;
}

@Entity('consent_records')
@Index(['tenantId', 'contactId'])
export class ConsentRecord extends BaseEntity {
  @Column({ name: 'contact_id', type: 'uuid' })
  contactId!: string;

  @Column({ name: 'consent_type', length: 100 })
  consentType!: string;

  @Column({ type: 'boolean', default: false })
  granted!: boolean;

  @Column({ name: 'granted_at', type: 'timestamptz', nullable: true })
  grantedAt?: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @Column({ length: 100, nullable: true })
  source?: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
