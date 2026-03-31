import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notifications')
@Index(['tenantId', 'userId', 'status'])
export class Notification extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ length: 255 })
  type!: 'EMAIL' | 'SMS' | 'IN_APP' | 'WHATSAPP' | 'VOICE';

  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: 'UNREAD' })
  status!: 'UNREAD' | 'READ' | 'ARCHIVED';

  @Column({ type: 'jsonb', default: '{}' })
  meta!: Record<string, any>;
}
