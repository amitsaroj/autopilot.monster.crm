import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notes')
@Index(['tenantId', 'createdAt'])
export class Note extends BaseEntity {
  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @Column({ name: 'deal_id', type: 'uuid', nullable: true })
  dealId?: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];
}
