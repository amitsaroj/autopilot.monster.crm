import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('ai_prompts')
@Index(['tenantId', 'name'])
export class AiPrompt extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ name: 'is_favorite', default: false })
  isFavorite!: boolean;
}
