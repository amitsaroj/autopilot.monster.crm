import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum VoiceCampaignStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
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
}
