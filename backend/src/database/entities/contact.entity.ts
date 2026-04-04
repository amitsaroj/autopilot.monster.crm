import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Deal } from './deal.entity';
import { Activity } from './activity.entity';
import { Task } from './task.entity';
import { Note } from './note.entity';
import { Quote } from './quote.entity';

export enum ContactStatus {
  LEAD = 'LEAD',
  PROSPECT = 'PROSPECT',
  CUSTOMER = 'CUSTOMER',
  CHURNED = 'CHURNED',
}

@Entity('contacts')
@Index(['tenantId', 'email'], { unique: true })
export class Contact extends BaseEntity {
  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ length: 255 })
  email!: string;

  @Column({ length: 30, nullable: true })
  phone?: string;

  @Column({ length: 30, nullable: true })
  mobile?: string;

  @Column({ name: 'job_title', length: 200, nullable: true })
  jobTitle?: string;

  @Column({ length: 100, nullable: true })
  department?: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, (company) => company.contacts, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId?: string;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.LEAD,
  })
  status!: ContactStatus;

  @Column({ name: 'lead_source', nullable: true })
  leadSource?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' })
  customFields!: Record<string, any>;

  @Column({ name: 'do_not_contact', default: false })
  doNotContact!: boolean;

  @Column({ name: 'email_opt_out', default: false })
  emailOptOut!: boolean;

  @Column({ name: 'whatsapp_opt_in', default: false })
  whatsappOptIn!: boolean;

  @Column({ name: 'last_contacted_at', type: 'timestamptz', nullable: true })
  lastContactedAt?: Date;

  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl?: string;

  @Column({ name: 'twitter_handle', nullable: true })
  twitterHandle?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column()
  @Index()
  tenantId!: string;

  @OneToMany(() => Deal, (deal) => deal.contact)
  deals!: Deal[];

  @OneToMany(() => Activity, (activity) => activity.contact)
  activities!: Activity[];

  @OneToMany(() => Task, (task) => task.contact)
  tasks!: Task[];

  @OneToMany(() => Note, (note) => note.contact)
  noteItems!: Note[];

  @OneToMany(() => Quote, (quote) => quote.contact)
  quotes!: Quote[];
}
