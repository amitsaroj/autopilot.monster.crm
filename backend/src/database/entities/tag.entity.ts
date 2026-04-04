import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_tags')
export class Tag extends BaseEntity {
  @Column()
  name!: string;

  @Column({ default: '#6366f1' })
  color!: string;

  @Column({ default: 'GENERIC' })
  type!: string; // LEAD, CONTACT, COMPANY, DEAL, PRODUCT, GENERIC
}
