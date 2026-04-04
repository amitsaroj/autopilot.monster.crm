import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_segments')
export class Segment extends BaseEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'json' })
  rules!: any; // JSON definition of filters: { operator: 'AND', conditions: [...] }

  @Column({ default: 'LEAD' })
  entityType!: string; // LEAD, CONTACT, COMPANY, DEAL
}
