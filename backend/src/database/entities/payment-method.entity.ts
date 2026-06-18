import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('payment_methods')
@Index(['tenantId', 'stripePaymentMethodId'], { unique: true })
export class PaymentMethod extends BaseEntity {
  @Column({ name: 'stripe_payment_method_id' })
  stripePaymentMethodId!: string;

  @Column({ length: 50, default: 'card' })
  type!: string;

  @Column({ name: 'last_four', length: 4, nullable: true })
  lastFour?: string;

  @Column({ length: 50, nullable: true })
  brand?: string;

  @Column({ name: 'exp_month', type: 'integer', nullable: true })
  expMonth?: number;

  @Column({ name: 'exp_year', type: 'integer', nullable: true })
  expYear?: number;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;
}
