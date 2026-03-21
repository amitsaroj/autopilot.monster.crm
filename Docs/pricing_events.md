# Pricing Events Lifecycle
Project: autopilot.monster.crm

---

## 1. Event Emitter
The Pricing and Billing module relies heavily on NestJS `EventEmitter2` for internal state transitions.

## 2. Subscription Lifecycle Events

| Event Name | Fired When | Payload | Subscribers |
|---|---|---|---|
| `billing.subscription.created` | New tenant upgrades from trial | `{ tenantId, planId, stripeSubId }` | Re-evaluates default limits, sends welcome email |
| `billing.subscription.updated` | Stripe webhook indicates plan change | `{ tenantId, oldPlanId, newPlanId }` | Flushes Redis feature flags cache, updates UI state |
| `billing.subscription.cancelled` | User or Stripe cancels sub | `{ tenantId, reason }` | Queues 30-day deletion warning |
| `billing.payment.failed` | Stripe charge fails | `{ tenantId, invoiceId, amount }` | Triggers dunning (notification) sequence |

## 3. Usage Events

| Event Name | Fired When | Subscribers |
|---|---|---|
| `billing.usage.incremented` | Usage counter goes up | `UsageOverageWatcher` checks if limits are breached |
| `billing.limit.reached` | Soft limit threshold hit | Sends in-app warning notification to tenant admins |
| `billing.hard_limit.hit` | Hard limit threshold hit | Disables feature temporarily, drops incoming webhooks |

## 4. Feature Toggle Events

| Event Name | Fired When | Subscribers |
|---|---|---|
| `billing.feature_flag.toggled` | Super admin enables/disables a feature | `RedisCacheInvalidator` immediately blasts cache keys |
