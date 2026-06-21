import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('coupons')
@Index(['tenantId', 'code'], { unique: true })
export class Coupon extends BaseEntity {
  @Column({ length: 50 })
  code!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
    default: 'PERCENTAGE',
  })
  discountType!: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue!: number;

  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses?: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount!: number;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minAmount?: number;

  @Column({ name: 'valid_from', type: 'timestamptz', nullable: true })
  validFrom?: Date;

  @Column({ name: 'valid_until', type: 'timestamptz', nullable: true })
  validUntil?: Date;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  /** Restrict to specific plan IDs */
  @Column({ name: 'applicable_plans', type: 'jsonb', default: '[]' })
  applicablePlans!: string[];
}
