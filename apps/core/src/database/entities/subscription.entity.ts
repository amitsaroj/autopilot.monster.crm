import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('subscriptions')
@Index(['tenantId', 'status'])
export class Subscription extends BaseEntity {
  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED', 'EXPIRED'],
    default: 'TRIAL',
  })
  status!: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

  @Column({ name: 'billing_cycle' })
  billingCycle!: 'MONTHLY' | 'ANNUAL';

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ name: 'current_period_start', type: 'timestamptz', nullable: true })
  currentPeriodStart?: Date;

  @Column({ name: 'current_period_end', type: 'timestamptz', nullable: true })
  currentPeriodEnd?: Date;

  @Column({ name: 'trial_ends_at', type: 'timestamptz', nullable: true })
  trialEndsAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId?: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;
}
