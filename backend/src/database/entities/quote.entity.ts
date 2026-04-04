import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Deal } from './deal.entity';
import { Contact } from './contact.entity';

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

  @ManyToOne(() => Deal, (deal) => deal.quotes, { nullable: true })
  @JoinColumn({ name: 'deal_id' })
  deal?: Deal;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId?: string;

  @ManyToOne(() => Contact, (contact) => contact.quotes, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

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
