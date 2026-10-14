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
}
