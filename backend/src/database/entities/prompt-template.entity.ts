import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('prompt_templates')
@Index(['tenantId', 'category'])
export class PromptTemplate extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text' })
  template!: string;

  @Column({ length: 100, default: 'general' })
  category!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: '[]' })
  variables!: string[];

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
