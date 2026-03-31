import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('knowledge_bases')
@Index(['tenantId', 'name'])
export class KnowledgeBase extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'source_type' })
  sourceType!: 'FILE' | 'URL' | 'TEXT' | 'INTEGRATION';

  @Column({ name: 'source_config', type: 'jsonb', default: '{}' })
  sourceConfig!: Record<string, any>;

  @Column({ name: 'vector_collection_name', nullable: true })
  vectorCollectionName?: string;

  @Column({ default: 'PROCESSING' })
  status!: 'PROCESSING' | 'READY' | 'FAILED';

  @Column({ name: 'index_meta', type: 'jsonb', default: '{}' })
  indexMeta!: Record<string, any>;
}
