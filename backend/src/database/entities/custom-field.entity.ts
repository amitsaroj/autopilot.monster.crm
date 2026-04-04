import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_custom_fields')
export class CustomField extends BaseEntity {
  @Column()
  name!: string; // Internal name: e.g. "vat_number"

  @Column()
  label!: string; // UI label: e.g. "VAT Number"

  @Column({ default: 'TEXT' })
  type!: string; // TEXT, NUMBER, DATE, SELECT, MULTI_SELECT, BOOLEAN

  @Column({ type: 'json', nullable: true })
  options?: string[]; // Options for SELECT/MULTI_SELECT

  @Column({ default: 'LEAD' })
  entityType!: string; // LEAD, CONTACT, COMPANY, DEAL, PRODUCT

  @Column({ default: false })
  isRequired!: boolean;

  @Column({ default: 0 })
  order!: number;
}
