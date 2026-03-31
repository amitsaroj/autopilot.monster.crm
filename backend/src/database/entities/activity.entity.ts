import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  TASK = 'TASK',
  WHATSAPP = 'WHATSAPP',
}

@Entity('activities')
@Index(['tenantId', 'occurredAt'])
export class Activity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type!: ActivityType;

  @Column({ length: 500 })
  subject!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @Column({ name: 'deal_id', type: 'uuid', nullable: true })
  dealId?: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId?: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'duration_minutes', type: 'integer', nullable: true })
  durationMinutes?: number;

  @Column({ length: 200, nullable: true })
  outcome?: string;
}
