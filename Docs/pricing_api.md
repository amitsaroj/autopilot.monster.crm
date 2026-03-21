# Pricing API
Project: autopilot.monster.crm

---

## 1. Endpoints Overview
The Pricing API handles operations related to plans, feature evaluation, usage tracking, and invoice payments.

---

## 2. External Endpoints (For Tenants)

### `GET /v1/billing/plans`
Returns all public active plans sorted by price.
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Professional",
      "priceMonthly": 199,
      "features": ["ai_chat", "voice_calls"]
    }
  ]
}
```

### `GET /v1/billing/usage/current`
Returns up-to-the-minute usage stats for the current billing cycle.
```json
{
  "success": true,
  "data": {
    "period_start": "2024-10-01T00:00:00Z",
    "period_end": "2024-10-31T23:59:59Z",
    "metrics": {
      "ai_messages": { "used": 1420, "limit": 10000, "overage": 0 },
      "call_minutes": { "used": 2050, "limit": 2000, "overage": 50, "overage_cost": 1.00 }
    },
    "projected_overage_bill": 1.00
  }
}
```

### `POST /v1/billing/subscription/upgrade`
Upgrades the tenant's plan.
```json
// Request
{ "planId": "uuid" }

// Response
{ "success": true, "proratedAmountDue": 85.50, "requiresAction": false }
```

---

## 3. Internal Endpoints (For Super Admin)

### `PATCH /v1/admin/plans/:id`
Modify plan definitions (prices, names). Cannot modify prices of plans with active subscriptions (must archive and create a new plan version).

### `POST /v1/admin/feature-overrides`
Grants a specific tenant access to a feature not normally on their plan.
```json
{
  "tenantId": "uuid",
  "featureKey": "custom_domain",
  "enabled": true
}
```

### `POST /v1/admin/credits`
Manually grant courtesy credits to a tenant to comp an invoice.
```json
{
  "tenantId": "uuid",
  "amount": 50.00,
  "reason": "Customer Support Apology"
}
```
