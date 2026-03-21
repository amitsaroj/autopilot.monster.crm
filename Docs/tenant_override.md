# Tenant Override Strategy
Project: autopilot.monster.crm

---

## 1. What is an Override?
AutopilotMonster sales reps often need to close massive Enterprise deals by creating custom permutations of features and limits that don't neatly fit into a public plan tier.

We handle this via **Tenant Overrides** instead of creating a unique `plan_id` in the database for every single custom customer.

---

## 2. Override Database Model

```sql
CREATE TABLE tenant_overrides (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
  max_users INT NULL,             -- NULL means fallback to base plan
  max_api_requests INT NULL,
  custom_features JSONB DEFAULT '{}', -- e.g. {"custom_domain": true}
  discount_percentage INT DEFAULT 0
);
```

## 3. Evaluation Precedence
The `PricingService` executes a deep merge.

```typescript
const basePlan = await this.repo.getPlan(tenant.planId);
const overrides = await this.repo.getOverrides(tenant.id);

const effectiveLimits = {
  ...basePlan.limits,
  ...overrides // Merges and overwrites ONLY if the key exists and is non-null
};
```

## 4. Operational View
Super Admins configure this right on the Tenant Detail view in the internal Admin panel.
"Grant feature -> White-labeling" -> Saves to `tenant_overrides`.
This massively simplifies sales ops.
