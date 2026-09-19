import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('voice_calls')
@Index(['tenantId', 'sid'])
export class VoiceCall extends BaseEntity {
  @Column({ unique: true })
  sid!: string; // Twilio SID

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column({
    type: 'enum',
    enum: ['INBOUND', 'OUTBOUND'],
  })
  direction!: 'INBOUND' | 'OUTBOUND';

  @Column({ default: 'QUEUED' })
  status!: string;

  @Column({ name: 'duration_seconds', type: 'integer', default: 0 })
  durationSeconds!: number;

  @Column({ name: 'recording_url', nullable: true })
  recordingUrl?: string;

  @Column({ type: 'text', nullable: true })
  transcript?: string;

  @Column({ name: 'ai_summary', type: 'text', nullable: true })
  aiSummary?: string;

  @Column({ length: 20, nullable: true })
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

  @Column({ name: 'voice_profile', length: 50, nullable: true })
  voiceProfile?: string;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId?: string;

  @Column({ name: 'recipient_id', type: 'uuid', nullable: true })
  recipientId?: string;

  @Column({ name: 'cost_amount', type: 'decimal', precision: 10, scale: 4, default: 0 })
  costAmount!: number;

  /** Which VoiceProvider placed this call — 'twilio' today; see providers/voice-provider.interface.ts. */
  @Column({ length: 30, default: 'twilio' })
  provider!: string;

  /** Twilio AMD result (human/machine_start/machine_end_beep/machine_end_silence/machine_end_other/fax/unknown), when machine detection was requested. */
  @Column({ name: 'answered_by', length: 30, nullable: true })
  answeredBy?: string;

  /** Object key of this call's recording in MinIO, once downloaded from the provider — see recordingUrl for the (presigned, expiring) playback link. */
  @Column({ name: 'recording_object_key', nullable: true })
  recordingObjectKey?: string;

  /** True once the AI initiated a live transfer to a human during this call. */
  @Column({ name: 'transferred_to_human', default: false })
  transferredToHuman!: boolean;
}
