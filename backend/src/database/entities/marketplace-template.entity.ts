import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('marketplace_templates')
@Index(['tenantId', 'category'])
export class MarketplaceTemplate extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 50 })
  category!: string;

  @Column({
    type: 'enum',
    enum: ['WORKFLOW', 'VOICE_SCRIPT', 'PROMPT', 'CHATBOT', 'REPORT'],
    default: 'WORKFLOW',
  })
  type!: 'WORKFLOW' | 'VOICE_SCRIPT' | 'PROMPT' | 'CHATBOT' | 'REPORT';

  @Column({ type: 'jsonb' })
  content!: Record<string, any>;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'boolean', default: false })
  published!: boolean;

  @Column({ name: 'install_count', type: 'int', default: 0 })
  installCount!: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
