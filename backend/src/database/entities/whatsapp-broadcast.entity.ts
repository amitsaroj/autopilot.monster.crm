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

export enum WhatsAppBroadcastRecurrence {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export enum WhatsAppBroadcastApprovalStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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

  @Column({ name: 'recipient_local_time', type: 'varchar', length: 5, nullable: true })
  recipientLocalTime?: string | null;

  @Column({ name: 'recurrence_frequency', type: 'varchar', length: 10, nullable: true })
  recurrenceFrequency?: WhatsAppBroadcastRecurrence | null;

  @Column({ name: 'recurrence_end_at', type: 'timestamptz', nullable: true })
  recurrenceEndAt?: Date | null;

  @Column({ name: 'recurrence_max_occurrences', type: 'integer', nullable: true })
  recurrenceMaxOccurrences?: number | null;

  @Column({ name: 'recurrence_series_id', type: 'uuid', nullable: true })
  recurrenceSeriesId?: string | null;

  @Column({ name: 'recurrence_occurrence', type: 'integer', default: 1 })
  recurrenceOccurrence!: number;

  @Column({ name: 'recurrence_state', type: 'varchar', length: 10, nullable: true })
  recurrenceState?: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'FAILED' | 'COMPLETED' | null;

  @Column({ name: 'approval_required', type: 'boolean', default: false })
  approvalRequired!: boolean;

  @Column({
    name: 'approval_status',
    type: 'varchar',
    length: 16,
    default: WhatsAppBroadcastApprovalStatus.NOT_REQUIRED,
  })
  approvalStatus!: WhatsAppBroadcastApprovalStatus;

  @Column({ name: 'approval_requested_by', type: 'uuid', nullable: true })
  approvalRequestedBy?: string | null;

  @Column({ name: 'approval_reviewed_by', type: 'uuid', nullable: true })
  approvalReviewedBy?: string | null;

  @Column({ name: 'approval_reviewed_at', type: 'timestamptz', nullable: true })
  approvalReviewedAt?: Date | null;

  @Column({ name: 'approval_note', type: 'text', nullable: true })
  approvalNote?: string | null;

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
