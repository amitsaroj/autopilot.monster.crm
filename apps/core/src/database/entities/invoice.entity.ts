import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Subscription } from './subscription.entity';

@Entity('invoices')
@Index(['tenantId', 'number'], { unique: true })
export class Invoice extends BaseEntity {
  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId!: string;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription?: Subscription;

  @Column({ length: 50, unique: true })
  number!: string;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID'],
    default: 'OPEN',
  })
  status!: 'DRAFT' | 'OPEN' | 'PAID' | 'UNCOLLECTIBLE' | 'VOID';

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total!: number;

  @Column({ length: 3 })
  currency!: string;

  @Column({ name: 'period_start', type: 'timestamptz' })
  periodStart!: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  periodEnd!: Date;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate!: Date;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date;

  @Column({ name: 'stripe_invoice_id', nullable: true })
  stripeInvoiceId?: string;

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl?: string;

  @Column({ name: 'line_items', type: 'jsonb', default: '[]' })
  lineItems!: Array<{
    description: string;
    amount: number;
    quantity: number;
    unit_amount: number;
  }>;
}
