import { NotFoundException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

import { Subscription } from '../../database/entities/subscription.entity';
import { Plan } from '../../database/entities/plan.entity';

export const TRIAL_DAYS = 14;
export const TRIAL_PLAN_SLUG = 'FREE';
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PAST_DUE_GRACE_DAYS = 7;

/** BILLING_PAST_DUE_GRACE_DAYS: days a PAST_DUE tenant keeps access while dunning runs. */
export function pastDueGraceDays(): number {
  const days = Number(process.env.BILLING_PAST_DUE_GRACE_DAYS ?? DEFAULT_PAST_DUE_GRACE_DAYS);
  return Number.isFinite(days) && days >= 0 ? days : DEFAULT_PAST_DUE_GRACE_DAYS;
}

/** Whether a subscription currently grants its plan's features and limits. */
export function isSubscriptionEntitled(
  sub: Pick<Subscription, 'status' | 'trialEndsAt' | 'pastDueSince' | 'updatedAt'>,
  now = new Date(),
  graceDays = pastDueGraceDays(),
): boolean {
  switch (sub.status) {
    case 'ACTIVE':
      return true;
    case 'TRIAL':
      return !sub.trialEndsAt || new Date(sub.trialEndsAt).getTime() > now.getTime();
    case 'PAST_DUE': {
      const since = sub.pastDueSince ?? sub.updatedAt;
      return !!since && new Date(since).getTime() + graceDays * DAY_MS > now.getTime();
    }
    default:
      return false;
  }
}

/**
 * Returns the tenant's latest subscription, creating a TRIAL on the default plan if the tenant
 * has never had one. Serialised per tenant with an advisory lock so concurrent callers
 * (signup, first login, guards) cannot create duplicates.
 */
export function ensureTrialSubscription(
  manager: EntityManager,
  tenantId: string,
): Promise<Subscription> {
  return manager.transaction(async (tx) => {
    await tx.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`subscription:${tenantId}`]);
    const repo = tx.getRepository(Subscription);
    const existing = await repo.findOne({ where: { tenantId }, order: { createdAt: 'DESC' } });
    if (existing) return existing;

    const plan = await tx.getRepository(Plan).findOne({ where: { slug: TRIAL_PLAN_SLUG } });
    if (!plan) throw new NotFoundException('Default plan not configured');

    return repo.save(
      repo.create({
        tenantId,
        planId: plan.id,
        status: 'TRIAL',
        billingCycle: 'MONTHLY',
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * DAY_MS),
      }),
    );
  });
}
