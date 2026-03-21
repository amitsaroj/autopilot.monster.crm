# Subscription State Machine
Project: autopilot.monster.crm

---

## 1. Definitive States

A Tenant's access is governed by the `status` column in the `subscriptions` table.

| State | Implication | API Behavior |
|---|---|---|
| `TRIAL` | Full access, 14-day clock ticking. | 200 OK |
| `ACTIVE` | Paying customer in good standing. | 200 OK |
| `PAST_DUE` | Stripe charge failed. Grace period. | 200 OK (Shows UI Banner) |
| `CANCELED` | Cancelled voluntarily, period ended. | 403 Forbidden (Only billing APIs work) |
| `SUSPENDED` | Trust & Safety block or unpaid. | 403 Forbidden |
| `INCOMPLETE` | Failed 3D Secure / SCA auth on checkout. | 402 Payment Required |

---

## 2. State Transition Events

When a Stripe webhook triggers a state change, a massive internal transition occurs.
Example: `ACTIVE` → `CANCELED`

1. Internal trigger: Update `subscriptions.status = 'CANCELED'`.
2. Disable all active API keys for the tenant.
3. Pause all active Workflows (they emit a `workflow.paused` status to prevent background loop errors).
4. Remove Twilio Webhook bindings to prevent inbound charges.
5. Invalidate all user sessions, forcing a logout. Only users with `billing:manage` can log back in to reactivate.
