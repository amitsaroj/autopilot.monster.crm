import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('whatsapp_broadcasts')
@Index(['tenantId', 'status'])
export class WhatsappBroadcast extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'template_name', length: 255 })
  templateName!: string;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED'],
    default: 'DRAFT',
  })
  status!: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';

  /** Segment ID or contact list */
  @Column({ name: 'target_segment_id', type: 'uuid', nullable: true })
  targetSegmentId?: string;

  @Column({ name: 'target_contacts', type: 'jsonb', default: '[]' })
  targetContacts!: string[];

  @Column({ name: 'total_recipients', type: 'int', default: 0 })
  totalRecipients!: number;

  @Column({ name: 'sent_count', type: 'int', default: 0 })
  sentCount!: number;

  @Column({ name: 'delivered_count', type: 'int', default: 0 })
  deliveredCount!: number;

  @Column({ name: 'read_count', type: 'int', default: 0 })
  readCount!: number;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
