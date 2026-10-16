import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/** Processed Stripe webhook events — the primary key makes delivery idempotent. */
@Entity('stripe_events')
export class StripeEvent {
  @PrimaryColumn({ length: 255 })
  id!: string;

  @Column({ length: 100 })
  type!: string;

  @Column({ type: 'bigint' })
  created!: number;

  @CreateDateColumn({ name: 'processed_at', type: 'timestamptz' })
  processedAt!: Date;
}
