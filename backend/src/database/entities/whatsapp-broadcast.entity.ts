import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum WhatsAppBroadcastStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('whatsapp_broadcasts')
export class WhatsAppBroadcast extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string;

  @Column({ name: 'phone_number_id', type: 'varchar', length: 64, nullable: true })
  phoneNumberId?: string;

  @Column({ name: 'template_variables', type: 'jsonb', default: '{}' })
  templateVariables!: Record<string, string>;

  @Column({ name: 'contact_filter', type: 'jsonb', default: '{}' })
  contactFilter!: {
    tags?: string[];
    status?: string[];
    segmentIds?: string[];
    customField?: { key: string; value: string };
    excludeTags?: string[];
    excludeContactIds?: string[];
    frequencyCap?: { maxMessages: number; windowHours: number };
    maxRecipients?: number;
  };

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt?: Date;

  @Column({
    type: 'enum',
    enum: WhatsAppBroadcastStatus,
    default: WhatsAppBroadcastStatus.DRAFT,
  })
  status!: WhatsAppBroadcastStatus;

  @Column({ name: 'template_components', type: 'jsonb', default: '[]' })
  templateComponents!: unknown[];

  @Column({ name: 'audience_prepared', default: false })
  audiencePrepared!: boolean;

  @Column({ name: 'control_version', default: 0 })
  controlVersion!: number;

  @Column({ name: 'next_send_at', type: 'timestamptz', nullable: true })
  nextSendAt?: Date;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string | null;

  @Column({ default: 0 })
  total!: number;

  @Column({ default: 0 })
  sent!: number;

  @Column({ default: 0 })
  delivered!: number;

  @Column({ default: 0 })
  read!: number;

  @Column({ default: 0 })
  failed!: number;
}
