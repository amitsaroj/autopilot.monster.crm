import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum BillingType {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

@Entity('products')
@Index(['tenantId', 'sku'])
export class Product extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 100, nullable: true })
  sku?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: BillingType,
    default: BillingType.ONE_TIME,
  })
  billingType!: BillingType;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ default: 'ACTIVE' })
  status!: 'ACTIVE' | 'INACTIVE';
}
