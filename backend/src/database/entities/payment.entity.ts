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

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ default: 'PENDING' })
  status!: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED';

  @Column({ default: 'stripe' })
  provider!: string;

  @Column({ name: 'provider_payment_id', nullable: true })
  providerPaymentId?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;
}
