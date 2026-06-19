import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum WhatsAppBroadcastStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('whatsapp_broadcasts')
export class WhatsAppBroadcast extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string;

  @Column({ name: 'template_variables', type: 'jsonb', default: '{}' })
  templateVariables!: Record<string, string>;

  @Column({ name: 'contact_filter', type: 'jsonb', default: '{}' })
  contactFilter!: {
    tags?: string[];
    status?: string[];
    customField?: { key: string; value: string };
  };

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt?: Date;

  @Column({
    type: 'enum',
    enum: WhatsAppBroadcastStatus,
    default: WhatsAppBroadcastStatus.DRAFT,
  })
  status!: WhatsAppBroadcastStatus;

  @Column({ default: 0 })
  total!: number;

  @Column({ default: 0 })
  sent!: number;

  @Column({ default: 0 })
  delivered!: number;

  @Column({ default: 0 })
  read!: number;

  @Column({ default: 0 })
  failed!: number;
}
