# Pricing Permissions
Project: autopilot.monster.crm

---

## 1. Resource: `billing`
Only users with specific RBAC permissions can view or modify billing data.

### 1.1 Actions
- `billing:read` - View current plan, limits, overage stats, and past invoices.
- `billing:write` - Update active credit card / payment method.
- `billing:manage` - Upgrade/downgrade plan, purchase add-on credits, or cancel subscription.

### 1.2 Default Placements
- **Super Admin:** Full Access.
- **Tenant Admin:** `billing:read`, `billing:write`, `billing:manage`.
- **Sales Rep / Support:** No access. Attempts to reach `/v1/billing` return `403 Forbidden`.

### 1.3 Billing Admin Role
Tenants can create a custom `Billing Admin` role (e.g., for an external accountant) that has *only* `billing:read` and `billing:write`, but completely lacks `crm:*` permissions, preventing them from seeing customer lead data.
