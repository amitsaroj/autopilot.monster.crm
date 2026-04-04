import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('articles')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'category'])
export class Article extends BaseEntity {
  @Column({ length: 500 })
  title!: string;

  @Column({ unique: true, length: 600 })
  slug!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ length: 200, nullable: true })
  category?: string;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status!: ArticleStatus;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId?: string;

  @Column({ type: 'int', default: 0 })
  views!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;
}
