import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('whatsapp_messages')
@Index(['tenantId', 'messageSid'])
export class WhatsAppMessage extends BaseEntity {
  @Column({ name: 'message_sid', unique: true })
  messageSid!: string;

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({
    type: 'enum',
    enum: ['INBOUND', 'OUTBOUND'],
  })
  direction!: 'INBOUND' | 'OUTBOUND';

  @Column({ default: 'SENT' })
  status!: string;

  @Column({ name: 'media_urls', type: 'text', array: true, default: '{}' })
  mediaUrls!: string[];
}
