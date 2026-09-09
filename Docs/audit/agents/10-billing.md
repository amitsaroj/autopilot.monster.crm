# Agent 10 — Billing Platform

**Date:** 2026-07-22  
**Repo:** `/data/Antier-project/Demo/autopilots.monster.crm`  
**Wave:** Billing platform fixes (BL-C09, F-031, F-032 partial)

---

## Completed

| ID | Item | Status |
|----|------|--------|
| BL-C09 | Stripe placeholder price IDs | Fixed — env-driven resolution + honest 400 errors |
| F-031 | Stripe subscriptions / webhooks / wallet | Improved — price validation, webhook body checks, coupon module wired |
| F-032 | Razorpay / PayPal / coupons | Partial — coupons registered; alt pay returns 503 with config hint |
| FE | Admin billing page | Fixed — `/monetization/usage` (was `/usage/all`), real invoices, metric keys |

---

## Changes made

### Backend

1. **`stripe-price.util.ts`** — Resolves price IDs from `STRIPE_PRICE_*` env vars, rejects placeholders, falls back to DB plan prices.
2. **`app.config.ts`** — Added `app.stripe.prices`, `app.paypal`, `app.razorpay` config blocks.
3. **`billing.service.ts`** — Uses env-aware price resolution; checkout/downgrade return clear errors when unset; webhook validates raw body and returns `{ received, type }`.
4. **`seed.ts`** — Removed hardcoded `price_*_placeholder` values; reads env on create; syncs env prices on re-seed for existing plans.
5. **`monetization.module.ts`** — Registered `BillingExtController` (coupons), `CouponService`, `Coupon` entity, `PaypalService`, `RazorpayService`.
6. **`billing-ext.controller.ts`** — Coupon-only routes at `billing/coupons/*`; removed duplicate wallet routes that conflicted with `BillingController`.
7. **`paypal.service.ts` / `razorpay.service.ts`** — Return `503 ServiceUnavailable` with config hints instead of fake checkout URLs.

### Frontend

1. **`admin/billing/page.tsx`** — Fixed usage endpoint, wired invoice list from API, aligned usage metric keys with backend (`contacts_limit`, `ai_tokens`, `workflow_runs`).

### Env / docs

1. **`backend/.env.example`** — Documented all Stripe price ID vars and alt-payment placeholders.
2. **`backend/.env.production.example`** — Same Stripe price vars for production.

---

## Required environment variables

### Stripe (required for paid checkout)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_PRICE_STARTER_MONTHLY` | Starter plan monthly price ID |
| `STRIPE_PRICE_STARTER_ANNUAL` | Starter plan annual price ID |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro plan monthly price ID |
| `STRIPE_PRICE_PRO_ANNUAL` | Pro plan annual price ID |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Enterprise plan monthly price ID |
| `STRIPE_PRICE_ENTERPRISE_ANNUAL` | Enterprise plan annual price ID |

Resolution order: env config → `process.env` → plan DB column. Placeholder strings are rejected.

### PayPal / Razorpay (optional — not implemented)

| Variable | Purpose |
|----------|---------|
| `PAYPAL_CLIENT_ID` | PayPal REST app client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal REST app secret |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook verification ID |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |

---

## API surfaces (canonical)

| Surface | Path prefix | Notes |
|---------|-------------|-------|
| Tenant billing | `/api/v1/billing/*` | Subscriptions, invoices, wallet, payment methods, webhook |
| Monetization alias | `/api/v1/monetization/*` | Plans, subscription, upgrade, portal, admin stats |
| Coupons | `/api/v1/billing/coupons/*` | CRUD + validate/redeem (newly wired) |
| Admin billing settings | `/api/v1/admin/billing/*` | Platform settings + revenue stats |
| Superadmin invoices | `/api/v1/admin/invoices` | Global invoice directory |
| Superadmin subscriptions | `/api/v1/admin/subscriptions` | Global subscription directory |

Webhook endpoints (both valid): `POST /billing/webhook`, `POST /monetization/webhook`

---

## Verification

| Check | Result |
|-------|--------|
| `stripe-price.util.spec.ts` | Run with billing tests |
| `billing-usage.spec.ts` | Existing usage metering unit tests |
| `billing-*-http.integration.spec.ts` | Subscription, wallet, webhook integration |
| Backend build | Run after changes |

---

## Remaining gaps

| Gap | Severity | Notes |
|-----|----------|-------|
| F-033 `/billing/plans` page missing | Medium | Sidebar link exists; no tenant plans page (Frontend agent) |
| PayPal / Razorpay full integration | Medium | Config + 503 stubs only; no checkout or webhooks |
| Marketplace plugin placeholder prices | Low | `seed-marketplace-plugins.ts` still has example price IDs |
| Metered Stripe billing (usage-based) | Medium | Usage tracked locally; not reported to Stripe Billing Meters |
| Coupon apply at checkout | Medium | Coupons CRUD works; not applied in Stripe checkout session |
| Billing queue worker | Low | No Bull processor for async billing jobs (BL-C08) |
| Dual billing API docs | Low | `billing` + `monetization` overlap — document single FE surface |
| Existing DB placeholder prices | Ops | Re-run seed or update plans via admin after setting env vars |
| Tenant `/billing` usage metric keys | Low | `(app)/billing/page.tsx` still uses `contacts`/`tasks`/`storage` keys |
| Admin billing mock transaction section header | Low | "Full Archives" button not wired |

---

## Reclassify suggestion

- **F-031** Stripe billing: 🟡 Partial → still Partial (env prices required; no metered Stripe sync)
- **F-032** Alt payments: ⚫ Broken → 🟡 Partial (coupons wired; PayPal/Razorpay honest 503)
- **BL-C09**: Critical → **remediated** pending prod env price IDs + smoke test
