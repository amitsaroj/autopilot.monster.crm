# Admin Pricing Management
Project: autopilot.monster.crm

---

## 1. Overview
The Super Admin dashboard includes a "Pricing Engine" section. This allows non-technical business operators to adjust pricing, package features, and manage limits without deploying code.

---

## 2. Capabilities

### 2.1 Plan Management
- Create new Plans.
- Toggle visibility (`is_public` visible on Marketing site vs. hidden for custom Enterprise configurations).
- Set core pricing (Monthly vs Annual rate).
- Map Stripe `price_id` directly in the UI.

### 2.2 Feature Matrix Builder
- A grid UI showing Plans on the X-axis and Feature Flags on the Y-axis.
- Admins tick checkboxes to enable features per plan.
- Backend saves these to `plan_features` table and flushes Redis invalidation events.

### 2.3 Limits Configuration
- Map numerical limits per plan.
- e.g., Set `max_users` = 5 for Starter, 25 for Pro.
- Set `max_ai_models` = `["gpt-4o-mini"]` for Starter, `["gpt-4o", "claude"]` for Pro.

---

## 3. Grandfathering Strategy
When an Admin changes the price of the "Professional" plan from $199 to $249:
1. They cannot edit the existing Plan record in PostgreSQL.
2. The system clones the Plan, marking the old one `status: ARCHIVED`.
3. New customers sign up on the $249 plan.
4. Existing customers (`subscription` linked to old `plan_id`) keep paying $199.
5. If an existing customer upgrades/downgrades or cancels, they lose the grandfathered pricing.

---

## 4. Admin Revenue Dashboard
Provides a holistic view of the system's financial health:
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Net Revenue Retention (NRR)
- Monthly Churn %
- Top Grossing Tenants
- Active usage profit margin (Gross Subscription Revenue - Estimated Vendor COGS)
