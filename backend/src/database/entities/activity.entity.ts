import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Contact } from './contact.entity';
import { Deal } from './deal.entity';
import { Company } from './company.entity';

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

  @ManyToOne(() => Contact, (contact) => contact.activities, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @Column({ name: 'deal_id', type: 'uuid', nullable: true })
  dealId?: string;

  @ManyToOne(() => Deal, (deal) => deal.activities, { nullable: true })
  @JoinColumn({ name: 'deal_id' })
  deal?: Deal;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, (company) => company.activities, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  @Index()
  ownerId?: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'duration_minutes', type: 'integer', nullable: true })
  durationMinutes?: number;

  @Column({ length: 200, nullable: true })
  outcome?: string;
}
