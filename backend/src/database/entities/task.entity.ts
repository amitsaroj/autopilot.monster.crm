import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('tasks')
@Index(['tenantId', 'dueDate'])
export class Task extends BaseEntity {
  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @Column({ name: 'deal_id', type: 'uuid', nullable: true })
  dealId?: string;

  @Column({ name: 'assignee_id', type: 'uuid', nullable: true })
  assigneeId?: string;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.OPEN,
  })
  status!: TaskStatus;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
