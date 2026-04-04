import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Contact } from './contact.entity';
import { Company } from './company.entity';
import { Pipeline } from './pipeline.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { Quote } from './quote.entity';
import { Activity } from './activity.entity';
import { Task } from './task.entity';
import { Note } from './note.entity';

export enum DealStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
}

@Entity('deals')
@Index(['tenantId', 'status'])
export class Deal extends BaseEntity {
  @Column({ length: 500 })
  name!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  value!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'pipeline_id', type: 'uuid' })
  @Index()
  pipelineId!: string;

  @ManyToOne(() => Pipeline, (pipeline) => pipeline.deals)
  @JoinColumn({ name: 'pipeline_id' })
  pipeline!: Pipeline;

  @Column({ name: 'stage_id', type: 'uuid' })
  @Index()
  stageId!: string;

  @ManyToOne(() => PipelineStage, (stage) => stage.deals)
  @JoinColumn({ name: 'stage_id' })
  stage!: PipelineStage;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId?: string;

  @Column({
    type: 'enum',
    enum: DealStatus,
    default: DealStatus.OPEN,
  })
  status!: DealStatus;

  @Column({ type: 'integer', default: 0 })
  probability!: number;

  @Column({ name: 'expected_close_date', type: 'date', nullable: true })
  expectedCloseDate?: Date;

  @Column({ name: 'actual_close_date', type: 'date', nullable: true })
  actualCloseDate?: Date;

  @Column({ name: 'lost_reason', type: 'text', nullable: true })
  lostReason?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' })
  customFields!: Record<string, any>;

  @Column()
  @Index()
  tenantId!: string;

  @OneToMany(() => Quote, (quote) => quote.deal)
  quotes!: Quote[];

  @OneToMany(() => Activity, (activity) => activity.deal)
  activities!: Activity[];

  @OneToMany(() => Task, (task) => task.deal)
  tasks!: Task[];

  @OneToMany(() => Note, (note) => note.deal)
  notes!: Note[];
}
