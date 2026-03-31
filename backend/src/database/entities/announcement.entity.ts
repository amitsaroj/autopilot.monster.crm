import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('announcements')
export class Announcement extends BaseEntity {
  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ length: 255, default: 'INFO' })
  severity!: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  target!: {
    plans?: string[];
    tenants?: string[];
    roles?: string[];
  };
}
