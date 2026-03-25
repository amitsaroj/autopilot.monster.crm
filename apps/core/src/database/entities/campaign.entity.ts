import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum CampaignType {
  VOICE = 'VOICE',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('campaigns')
export class Campaign extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: CampaignType, default: CampaignType.VOICE })
  type!: CampaignType;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status!: CampaignStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  agentId?: string;

  @Column({ type: 'int', default: 0 })
  totalLeads!: number;

  @Column({ type: 'int', default: 0 })
  completedLeads!: number;

  @Column({ type: 'int', default: 0 })
  qualifiedLeads!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  budget!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spent!: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;
}
