import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_CUSTOMER = 'PENDING_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

@Entity('tickets')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'priority'])
export class Ticket extends BaseEntity {
  @Column({ name: 'ticket_number', unique: true, length: 20 })
  ticketNumber!: string;

  @Column({ length: 500 })
  subject!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @Column({ name: 'assignee_id', type: 'uuid', nullable: true })
  assigneeId?: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status!: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority!: TicketPriority;

  @Column({ name: 'last_replied_at', type: 'timestamptz', nullable: true })
  lastRepliedAt?: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;
}
