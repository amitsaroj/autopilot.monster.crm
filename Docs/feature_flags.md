# Feature Flags Design
Project: autopilot.monster.crm

---

## 1. Overview
Feature flags control access to modules, limits, and UI elements. They allow:
- **Plan-based gating:** (e.g., Starter vs Enterprise)
- **Gradual rollouts:** (e.g., Beta testing new AI module)
- **Tenant overrides:** (e.g., Custom deal for a specific client)
- **Kill switches:** (e.g., Disabling Voice module globally during a Twilio outage)

---

## 2. Evaluation Hierarchy
When a request asks "Is feature X enabled for tenant Y?", the system evaluates in this exact order. The first definitive answer wins.

1. **Global Kill Switch** (`feature_flags` table)
   - If `enabled = false` and `scope = GLOBAL`, return `false`.
2. **Tenant Override** (`tenant_feature_overrides` table)
   - If tenant Y has a specific override for feature X, return that boolean.
3. **Plan Feature** (`plan_features` table)
   - If the tenant's active plan includes feature X in `plan_features`, return `true` or `false` based on the plan config.
4. **Default**
   - Return `false` (Deny by default).

---

## 3. Database Schema

### `feature_flags` (Global Switches & Rollouts)
| Column | Type | Notes |
|---|---|---|
| key | VARCHAR PK | e.g. `voice_calling`, `beta_ai` |
| description | TEXT | |
| enabled | BOOLEAN | |
| type | ENUM | GLOBAL, PERCENTAGE, TENANT_WHITELIST |
| rules | JSONB | e.g. `{ "percentage": 20 }` or `{ "whitelist": ["uuid1"] }` |

### `plan_features` (Plan-based gating)
| Column | Type | Notes |
|---|---|---|
| plan_id | UUID PK | |
| feature_key | VARCHAR PK | |
| enabled | BOOLEAN | |

### `tenant_feature_overrides` (Custom Deals / Exceptions)
| Column | Type | Notes |
|---|---|---|
| tenant_id | UUID PK | |
| feature_key | VARCHAR PK | |
| enabled | BOOLEAN | |

---

## 4. Code Implementation

```typescript
// Applying feature flag to a route
@Get('/voice/campaigns')
@Feature('voice_campaigns')  // Reflector retrieves this
@UseGuards(PlanGuard)        // Evaluates the flag
async getCampaigns() {
  return this.voiceService.list();
}
```

### 4.1 Caching Strategy
Checking the hierarchy requires up to 3 DB queries. This is heavily cached.
- Read from DB.
- Store in Redis: `SET feature:{tenantId}:voice_campaigns "true" EX 300` (5 min TTL).
- If a Plan or Override is updated in the Admin panel, the service publishes an invalidation event to clear the specific Redis keys for affected tenants immediately.

---

## 5. Frontend UI Behavior
The Next.js frontend fetches the tenant's evaluated feature flags on session load.

```typescript
// UI Component
const { features } = useWorkspace(); // Zustand store populated on app load

if (!features['workflow_engine']) {
  return <UpsellBlock feature="Workflows" requiredPlan="Professional" />;
}
return <WorkflowBuilder />;
```
- If false: UI completely hides the sidebar link, or shows a locked padlock with an "Upgrade Plan" CTA.
