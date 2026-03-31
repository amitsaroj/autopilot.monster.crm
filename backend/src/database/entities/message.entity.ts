import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
@Index(['conversationId', 'createdAt'])
export class Message extends BaseEntity {
  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId!: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation?: Conversation;

  @Column({
    type: 'enum',
    enum: ['USER', 'ASSISTANT', 'SYSTEM'],
  })
  role!: 'USER' | 'ASSISTANT' | 'SYSTEM';

  @Column({ type: 'text' })
  content!: string;

  @Column({ length: 50, default: 'TEXT' })
  type!: 'TEXT' | 'AUDIO' | 'IMAGE' | 'DOCUMENT';

  @Column({ type: 'jsonb', default: '{}' })
  meta!: Record<string, any>;
}
