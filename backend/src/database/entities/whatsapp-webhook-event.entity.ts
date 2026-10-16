import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type WhatsappWebhookEventStatus = 'RECEIVED' | 'PROCESSED' | 'FAILED' | 'IGNORED';

/**
 * Durable inbox for signed Meta webhooks. Deliberately not a BaseEntity: account-level
 * changes (template status, quality, account updates) arrive before a tenant is known.
 */
@Entity('whatsapp_webhook_events')
@Index('IDX_whatsapp_webhook_events_status_received', ['status', 'receivedAt'])
@Index('IDX_whatsapp_webhook_events_tenant_status', ['tenantId', 'status', 'receivedAt'])
export class WhatsAppWebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;

  @Column({ name: 'phone_number_id', type: 'varchar', length: 64, nullable: true })
  phoneNumberId!: string | null;

  @Column({ name: 'business_account_id', type: 'varchar', length: 64, nullable: true })
  businessAccountId!: string | null;

  @Column({ type: 'varchar', length: 64 })
  object!: string;

  @Column({ type: 'varchar', length: 64 })
  field!: string;

  @Index('UQ_whatsapp_webhook_events_dedupe_key', { unique: true })
  @Column({ name: 'dedupe_key', type: 'varchar', length: 64 })
  dedupeKey!: string;

  /** Single-change envelope: { object, entry: [{ id, changes: [change] }] }. */
  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 16, default: 'RECEIVED' })
  status!: WhatsappWebhookEventStatus;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;

  @CreateDateColumn({ name: 'received_at', type: 'timestamptz' })
  receivedAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null;
}
