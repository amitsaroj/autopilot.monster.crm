import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('companies')
@Index(['tenantId', 'name'])
export class Company extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, nullable: true })
  domain?: string;

  @Column({ length: 100, nullable: true })
  industry?: string;

  @Column({ name: 'size_range', nullable: true })
  sizeRange?: string;

  @Column({ name: 'annual_revenue_range', nullable: true })
  annualRevenueRange?: string;

  @Column({ length: 100, nullable: true })
  country?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ type: 'jsonb', nullable: true })
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  @Column({ length: 30, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  website?: string;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', default: '{}' })
  customFields!: Record<string, any>;
}
