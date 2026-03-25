import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum EmailDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

@Entity('crm_emails')
export class EmailMessage extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', length: 255 })
  from!: string;

  @Column({ type: 'varchar', length: 255 })
  to!: string;

  @Column({
    type: 'enum',
    enum: EmailDirection,
    default: EmailDirection.OUTBOUND,
  })
  direction!: EmailDirection;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ type: 'uuid', nullable: true })
  leadId?: string;

  @Column({ type: 'uuid', nullable: true })
  contactId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;
}
