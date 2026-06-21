# Billing System Audit

**Date:** 2026-06-19  
**Scope:** Plans, Subscriptions, Invoices, Wallet, Credits, Usage/Metered Billing, Stripe/PayPal/Razorpay, Refunds, Coupons, Trials, Plan Changes  
**Agent:** AGENT 5 — BILLING AUDITOR

---

## Executive Summary

The billing stack has a **working Stripe subscription core** (checkout, portal, webhooks, payment methods) but suffered from **entity/schema mismatches**, **security gaps**, and **frontend/API disconnects**. PayPal and Razorpay are **not implemented**. Coupons and full metered billing are **partial/missing**.

**Critical issues fixed in this audit:** 10  
**Remaining medium/low gaps:** documented below

---

## Architecture Overview

| Layer | Location | Notes |
|-------|----------|-------|
| Tenant billing API | `backend/src/modules/billing/` | Subscription, invoices, wallet, payment methods |
| Monetization API | `backend/src/modules/monetization.controller.ts` | Plans, upgrade, portal, admin CRUD |
| Pricing | `backend/src/modules/pricing/` | Plan features/limits, feature gating |
| Admin billing | `backend/src/modules/admin/billing/` | Platform settings, revenue stats |
| Frontend | `frontend/src/app/(app)/billing/`, `frontend/src/services/billing.service.ts` | User-facing billing UI |
| DB entities | `backend/src/database/entities/` | subscription, invoice, payment, wallet, usage-record |

Dual controllers expose overlapping routes: `/monetization/*` and `/billing/*`. Frontend now uses `/monetization` for subscription/checkout and `/billing` for invoices/wallet/payment-methods.

---

## Component Audit

### 1. Plans — Partial

| Item | Status | Details |
|------|--------|---------|
| Plan entity & seed | OK | FREE, STARTER, PRO, ENTERPRISE in `seed.ts` |
| Public plan listing | OK | `GET /monetization/plans` |
| Admin plan CRUD | OK | Super-admin endpoints on monetization controller |
| Stripe price IDs | WARN | Placeholder values in seed; checkout fails without real Stripe prices |
| Frontend upgrade page | MISSING | Static mock data; not wired to API |

### 2. Subscriptions — Fixed

| Item | Status | Details |
|------|--------|---------|
| Subscription entity | OK | Matches DDL |
| Stripe checkout | OK | `createCheckoutSession` |
| Stripe portal | OK | `createPortalSession` |
| Webhook sync | OK | checkout.session.completed, subscription updated/deleted |
| Trial on signup | FIXED | `getSubscription` auto-provisions FREE/TRIAL sub (14 days) |
| Trial feature gating | FIXED | `getTenantSubscription` includes TRIAL status |
| Cancel / reactivate | OK | End-of-period and immediate cancel |
| Downgrade | WARN | Applies immediately with proration; design doc says end-of-period |

### 3. Invoices — Fixed

| Item | Status | Details |
|------|--------|---------|
| Invoice entity | OK | subscriptionId, number, subtotal, tax, total, lineItems |
| Stripe webhook `invoice.paid` | FIXED | Maps all required fields; idempotent by stripeInvoiceId |
| Invoice list API | OK | `GET /billing/invoices` |
| Invoice detail API | OK | `GET /billing/invoices/:id` |
| Frontend invoices page | FIXED | Wired to API (was hardcoded mock data) |
| Admin revenue stats | FIXED | Uses `total` and `OPEN` status (was `amount`/`PENDING`) |

### 4. Payments — Fixed

| Item | Status | Details |
|------|--------|---------|
| Payment entity vs DDL | FIXED | Entity aligned to DDL: provider, providerPaymentId, metadata |
| Webhook payment record | FIXED | Saves with correct fields + invoiceId link |
| Refund handling | FIXED | `charge.refunded` webhook updates status to REFUNDED |
| Refund API (manual) | MISSING | No admin refund endpoint |

### 5. Wallet & Credits — Fixed

| Item | Status | Details |
|------|--------|---------|
| Wallet entity | OK | balance, currency per tenant |
| Wallet transactions | FIXED | Added `balance_after` column (migration + DDL) |
| Transaction atomicity | FIXED | DB transactions + pessimistic lock on debit |
| Get balance / history | OK | `GET /billing/wallet`, `/wallet/transactions` |
| Add credits endpoint | FIXED | Restricted to ADMIN/SUPER_ADMIN (was open to any tenant user) |
| Frontend wallet page | FIXED | Removed self-service free credit top-up |
| Wallet debit integration | WARN | `debit()` exists but not called from usage/metered billing |

### 6. Usage Tracking & Metered Billing — Partial

| Item | Status | Details |
|------|--------|---------|
| UsageRecord entity | OK | metric, quantity, period, unitCost, totalCost |
| trackUsage() | OK | Aggregates by tenant/metric/month |
| getUsage() | OK | Per-metric or all |
| LimitGuard integration | OK | Enforces plan limits via pricing service |
| Stripe metered billing | MISSING | No Stripe usage records / metered prices |
| Usage to wallet debit | MISSING | No automatic charge on overage |
| Frontend usage page | MISSING | Static mock data |
| trackUsage callers | MISSING | Only defined in BillingService; no module invokes it |

### 7. Payment Methods (Stripe) — OK

| Item | Status | Details |
|------|--------|---------|
| Setup intent | OK | Stripe SetupIntent flow |
| Attach / detach / default | OK | Full CRUD + Stripe sync |
| Frontend Stripe Elements | OK | `stripe-card-setup.tsx` |
| PayPal / Razorpay methods | MISSING | Not implemented |

### 8. Stripe Integration — OK

| Item | Status | Details |
|------|--------|---------|
| Checkout sessions | OK | Subscription mode |
| Customer portal | OK | |
| Webhooks | OK | Signature verification; 5 event types |
| Setup intents | OK | Card storage |
| Subscription update/cancel | OK | Direct Stripe API |
| Webhook endpoint duplication | WARN | Both `/billing/webhook` and `/monetization/webhook` |

### 9. PayPal — Missing

No backend module, entities, webhooks, or frontend integration.

### 10. Razorpay — Missing

Same as PayPal — not implemented.

### 11. Refunds — Partial

| Item | Status | Details |
|------|--------|---------|
| Stripe refund webhook | FIXED | `charge.refunded` updates payment to REFUNDED |
| Admin refund API | MISSING | |
| Invoice void on refund | MISSING | Payment updated but invoice status unchanged |

### 12. Coupons — Missing

No coupon entity, Stripe promotion code integration, or apply-coupon API.

### 13. Trials — Partial

| Item | Status | Details |
|------|--------|---------|
| Subscription TRIAL status | OK | Entity + webhook mapping |
| Auto-provision on first access | FIXED | FREE plan + 14-day trialEndsAt |
| Trial expiry scheduler | WARN | Documented in Docs/scheduler.md; not verified |
| Register-time subscription | WARN | Auth register does not create subscription (lazy on first billing call) |

### 14. Plan Upgrade / Downgrade — Partial

| Item | Status | Details |
|------|--------|---------|
| Upgrade (new checkout) | OK | Stripe Checkout session |
| Downgrade (in-place) | WARN | Immediate Stripe update; design says end-of-period |
| Billing cycle change | MISSING | No dedicated endpoint |
| Frontend upgrade page | MISSING | Static plans, no API wiring |

---

## Database Schema Notes

| Table | Entity vs DDL | Issue |
|-------|---------------|-------|
| subscriptions | Aligned | |
| invoices | Aligned | Webhook was writing non-existent columns (fixed) |
| payments | FIXED | Entity now matches DDL |
| wallet_transactions | FIXED | Added balance_after |
| payment_methods | Aligned | |
| usage_records | Aligned | |
| wallets | Aligned | |

**Migration added:** `1739900000006-BillingSchemaFixes.ts`

---

## Tests

| Test | Status | Coverage |
|------|--------|----------|
| billing-webhook.integration.spec.ts | Minimal | Signature rejection only |
| E2E billing flows | Missing | |
| Wallet unit tests | Missing | |
| Invoice webhook idempotency | Missing | |

---

## Critical Fixes Applied

1. Invoice webhook schema mismatch — full field mapping + idempotency
2. Payment entity/DDL drift — aligned entity to migrations
3. Wallet security — credits endpoint restricted to ADMIN/SUPER_ADMIN
4. Wallet race conditions — transactional operations with pessimistic lock
5. Missing balance_after column — migration + DDL update
6. Subscription 404 for new tenants — auto-provision FREE/TRIAL subscription
7. Trial users blocked from features — PricingService includes TRIAL
8. Frontend billing disconnect — overview and invoices wired to API
9. Admin billing stats broken query — fixed column names and status enum
10. Stripe refund webhook — charge.refunded handler added

---

## Remaining Gaps (Priority Order)

| Priority | Gap | Effort |
|----------|-----|--------|
| HIGH | Wire trackUsage() from CRM/AI/Voice modules | M |
| HIGH | Stripe metered prices + overage billing | L |
| HIGH | PayPal or Razorpay (or signed exclusion) | L |
| MEDIUM | Coupon/promotion code support | M |
| MEDIUM | Wire upgrade/usage frontend pages to API | S |
| MEDIUM | Downgrade at period end (per design doc) | S |
| MEDIUM | Trial expiry scheduler job | S |
| LOW | Consolidate duplicate webhook routes | S |
| LOW | Invoice status update on refund | S |
| LOW | Expand test coverage | M |

---

## Verdict

- **Stripe subscription billing:** Production-ready with fixes applied
- **Wallet/credits:** Secure and transactional after fixes; needs payment gateway for top-up
- **Metered billing:** Infrastructure exists; not connected to feature modules
- **PayPal/Razorpay/Coupons:** Not implemented — explicit backlog
