import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum VoiceCampaignStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  STOPPED = 'STOPPED',
}

@Entity('voice_campaigns')
@Index(['tenantId', 'status'])
export class VoiceCampaign extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: VoiceCampaignStatus,
    default: VoiceCampaignStatus.DRAFT,
  })
  status!: VoiceCampaignStatus;

  @Column({ name: 'from_number', length: 20 })
  fromNumber!: string;

  @Column({ type: 'text' })
  script!: string;

  @Column({ name: 'contact_list_id', type: 'uuid', nullable: true })
  contactListId?: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt?: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ name: 'total_contacts', type: 'integer', default: 0 })
  totalContacts!: number;

  @Column({ name: 'calls_made', type: 'integer', default: 0 })
  callsMade!: number;

  @Column({ name: 'calls_answered', type: 'integer', default: 0 })
  callsAnswered!: number;

  @Column({ name: 'calls_failed', type: 'integer', default: 0 })
  callsFailed!: number;

  /** Max simultaneous active calls this campaign is allowed to run. */
  @Column({ type: 'integer', default: 3 })
  concurrency!: number;

  /** 1 = no retry. A BUSY/NO-ANSWER/FAILED outcome retries up to this many total attempts. */
  @Column({ name: 'max_attempts', type: 'integer', default: 1 })
  maxAttempts!: number;

  @Column({ name: 'retry_delay_minutes', type: 'integer', default: 30 })
  retryDelayMinutes!: number;

  /** "HH:mm" in the campaign's timezone. Null on either means "no calling-hours restriction". */
  @Column({ name: 'calling_hours_start', length: 5, nullable: true })
  callingHoursStart?: string;

  @Column({ name: 'calling_hours_end', length: 5, nullable: true })
  callingHoursEnd?: string;

  @Column({ length: 64, default: 'UTC' })
  timezone!: string;

  /** Optional AI agent whose prompt drives the conversation instead of the free-text script. */
  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId?: string;

  @Column({ name: 'stopped_at', type: 'timestamptz', nullable: true })
  stoppedAt?: Date;
}
