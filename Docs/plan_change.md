# Plan Change Logic
Project: autopilot.monster.crm

---

## 1. Upgrades

When a tenant hits "Upgrade" (e.g., from Starter to Professional):
1. **Immediate Execution:** The tenant instantly receives access to the new features.
2. **Stripe Proration:** Stripe calculates the unused time on the $49 plan, credits it, and charges the remaining time on the $199 plan immediately.
3. **Database Update:** The `subscriptions.plan_id` is updated.
4. **Cache Invalidation:** The event `billing.subscription.updated` fires, which drops `tenant_features:{id}` and `limit:{id}` cache keys in Redis. The next API request will re-fetch the new, higher limits.

## 2. Downgrades

When a tenant clicks "Downgrade" (e.g., Enterprise to Starter):
1. **Validation Checks:** The system checks if the tenant has more users, pipelines, or contacts than the Starter plan allows. If they do, an error is thrown: *“You must reduce your active users to 5 and delete 500 contacts before downgrading to Starter.”*
2. **Delayed Execution:** Downgrades are *scheduled* at period end using Stripe’s `proration_behavior: none` and `billing_cycle_anchor`.
3. **Status:** The subscription `cancel_at_period_end` flag or schedule is set. The tenant remains on Enterprise until the exact renewal date.

## 3. Cancellations
- **Voluntary:** Triggered by user. Retains current features until period end. At period end, webhook `customer.subscription.deleted` triggers status change to `CANCELED`. App access is blocked entirely except for the "Reactivate" UI.
- **Involuntary:** Overdue payments (Dunning). Plan is marked `SUSPENDED` instantly after retry schedule exhausts.
