import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Contact } from './contact.entity';
import { Deal } from './deal.entity';
import { Company } from './company.entity';

@Entity('notes')
@Index(['tenantId', 'createdAt'])
export class Note extends BaseEntity {
  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @ManyToOne(() => Contact, (contact) => contact.notes)
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @Column({ name: 'deal_id', type: 'uuid', nullable: true })
  dealId?: string;

  @ManyToOne(() => Deal, (deal) => deal.notes)
  @JoinColumn({ name: 'deal_id' })
  deal?: Deal;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, (company) => company.notes)
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];
}
