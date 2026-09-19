import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum VoiceCampaignRecipientStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  CALLING = 'CALLING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  NO_ANSWER = 'NO_ANSWER',
  BUSY = 'BUSY',
  VOICEMAIL = 'VOICEMAIL',
  RETRY_PENDING = 'RETRY_PENDING',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED',
}

/** Standardized contact-level outcome, set once the AI's post-call analysis classifies the conversation. */
export enum VoiceCallDisposition {
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  CALLBACK_REQUESTED = 'CALLBACK_REQUESTED',
  QUALIFIED = 'QUALIFIED',
  NOT_QUALIFIED = 'NOT_QUALIFIED',
  WRONG_NUMBER = 'WRONG_NUMBER',
  DO_NOT_CALL = 'DO_NOT_CALL',
  CONVERTED = 'CONVERTED',
}

/**
 * One row per contact dialed by a bulk voice campaign. Persisted up front when
 * the campaign starts so attempt counts, retry scheduling, and per-recipient
 * status survive worker restarts and pause/resume cycles — the campaign's
 * aggregate counters (callsMade/callsAnswered/callsFailed) are derived from
 * these rows, not the other way around.
 */
@Entity('voice_campaign_recipients')
@Index(['tenantId', 'campaignId'])
@Index(['tenantId', 'campaignId', 'status'])
@Index(['tenantId', 'campaignId', 'contactId'], { unique: true })
export class VoiceCampaignRecipient extends BaseEntity {
  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId!: string;

  @Column({ name: 'contact_id', type: 'uuid' })
  contactId!: string;

  @Column({ length: 30 })
  phone!: string;

  @Column({
    type: 'enum',
    enum: VoiceCampaignRecipientStatus,
    default: VoiceCampaignRecipientStatus.PENDING,
  })
  status!: VoiceCampaignRecipientStatus;

  @Column({ type: 'integer', default: 0 })
  attempts!: number;

  @Column({ name: 'max_attempts', type: 'integer', default: 1 })
  maxAttempts!: number;

  @Column({ name: 'next_attempt_at', type: 'timestamptz', nullable: true })
  nextAttemptAt?: Date;

  @Column({ name: 'last_attempt_at', type: 'timestamptz', nullable: true })
  lastAttemptAt?: Date;

  @Column({ name: 'call_id', type: 'uuid', nullable: true })
  callId?: string;

  @Column({ length: 30, nullable: true })
  outcome?: string;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  /** AI-classified conversation outcome — set async by LeadIntelligenceService via the CALL_DISPOSITIONED event, once a transcript is analyzed. */
  @Column({
    type: 'enum',
    enum: VoiceCallDisposition,
    nullable: true,
  })
  disposition?: VoiceCallDisposition;
}
