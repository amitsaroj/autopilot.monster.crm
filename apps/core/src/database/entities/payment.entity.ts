import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Invoice } from './invoice.entity';

@Entity('payments')
@Index(['tenantId', 'status'])
export class Payment extends BaseEntity {
  @Column({ name: 'invoice_id', type: 'uuid', nullable: true })
  invoiceId?: string;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ length: 3 })
  currency!: string;

  @Column({
    type: 'enum',
    enum: ['SUCCEEDED', 'PENDING', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  })
  status!: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED';

  @Column({ name: 'payment_method', length: 100, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'stripe_payment_intent_id', nullable: true })
  stripePaymentIntentId?: string;

  @Column({ name: 'stripe_charge_id', nullable: true })
  stripeChargeId?: string;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;
}
