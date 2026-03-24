import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

@Entity('quotes')
@Index(['tenantId', 'number'], { unique: true })
export class Quote extends BaseEntity {
  @Column({ length: 50, unique: true })
  number!: string;

  @Column({ name: 'deal_id', type: 'uuid', nullable: true })
  dealId?: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @Column({
    type: 'enum',
    enum: QuoteStatus,
    default: QuoteStatus.DRAFT,
  })
  status!: QuoteStatus;

  @Column({ type: 'jsonb', default: '[]' })
  lineItems!: Array<{
    productId: string;
    description: string;
    qty: number;
    price: number;
    discount: number;
  }>;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount!: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt?: Date;
}
