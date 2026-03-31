import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Contact } from './contact.entity';

@Entity('conversations')
@Index(['tenantId', 'contactId'])
export class Conversation extends BaseEntity {
  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @Column({ length: 50 })
  channel!: 'VOICE' | 'WHATSAPP' | 'EMAIL' | 'WEBCHAT';

  @Column({
    type: 'enum',
    enum: ['OPEN', 'PENDING', 'CLOSED'],
    default: 'OPEN',
  })
  status!: 'OPEN' | 'PENDING' | 'CLOSED';

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt?: Date;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'jsonb', default: '{}' })
  meta!: Record<string, any>;
}
