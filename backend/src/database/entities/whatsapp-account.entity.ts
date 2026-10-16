import { Exclude } from 'class-transformer';
import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

export type WhatsappProviderName = 'meta';
export type WhatsappAccountStatus = 'CONNECTED' | 'DISCONNECTED';

@Entity('whatsapp_accounts')
@Index('IDX_whatsapp_accounts_tenant_status', ['tenantId', 'status'])
// Deliberately not a partial index: disconnect/soft-delete never releases ownership.
@Index('UQ_whatsapp_accounts_phone_number_id', ['phoneNumberId'], { unique: true })
export class WhatsAppAccount extends BaseEntity {
  @Column({ type: 'varchar', length: 30, default: 'meta' })
  provider!: WhatsappProviderName;

  @Column({ name: 'phone_number_id', type: 'varchar', length: 64 })
  phoneNumberId!: string;

  @Column({ name: 'business_account_id', type: 'varchar', length: 64 })
  businessAccountId!: string;

  @Column({ name: 'display_phone_number', type: 'varchar', length: 64, nullable: true })
  displayPhoneNumber!: string | null;

  @Column({ name: 'verified_name', type: 'varchar', length: 255, nullable: true })
  verifiedName!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'CONNECTED' })
  status!: WhatsappAccountStatus;

  @Exclude()
  @Column({ name: 'encrypted_access_token', type: 'text', nullable: true, select: false })
  encryptedAccessToken!: string | null;

  @Column({ name: 'validated_at', type: 'timestamptz', nullable: true })
  validatedAt!: Date | null;

  @Column({ name: 'disconnected_at', type: 'timestamptz', nullable: true })
  disconnectedAt!: Date | null;

  // Last known Meta state. Written by health checks and (separately) by webhook updates.
  @Column({ name: 'quality_rating', type: 'varchar', length: 20, nullable: true })
  qualityRating!: string | null;

  @Column({ name: 'messaging_limit_tier', type: 'varchar', length: 40, nullable: true })
  messagingLimitTier!: string | null;

  @Column({ name: 'name_status', type: 'varchar', length: 40, nullable: true })
  nameStatus!: string | null;

  /** null = unknown (never checked or Meta read failed). */
  @Column({ name: 'webhook_subscribed', type: 'boolean', nullable: true })
  webhookSubscribed!: boolean | null;

  @Column({ name: 'last_health_check_at', type: 'timestamptz', nullable: true })
  lastHealthCheckAt!: Date | null;

  /** Sanitized message of the last failed health check / remote setup / remote unsubscribe. */
  @Column({ name: 'last_health_error', type: 'varchar', length: 500, nullable: true })
  lastHealthError!: string | null;
}
