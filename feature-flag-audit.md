# Feature Flag System Audit

**Project:** autopilot.monster.crm  
**Date:** 2026-06-19  
**Agent:** Feature Flag Auditor (Agent 6)

---

## Executive Summary

The feature flag system had **backend API and admin CRUD scaffolding** in place, but **runtime enforcement did not match the documented evaluation hierarchy**. Global kill switches and tenant overrides were stored in the database but never read during request handling. A duplicate global guard (`FeatureGuard`) ran before `PlanGuard` with inconsistent rules, blocking `SUPER_ADMIN` bypass and causing double evaluation.

**Status after fixes:** Runtime evaluation now follows the documented hierarchy. Duplicate guard registration removed. Seed data aligned with controller feature keys.

| Area | Before | After |
|------|--------|-------|
| Evaluation hierarchy | Plan-only | Global → Tenant override → Plan → deny |
| Global guard enforcement | FeatureGuard + PlanGuard (conflict) | PlanGuard only |
| SUPER_ADMIN bypass | Broken (FeatureGuard ran first) | Fixed |
| Seed plan features | Missing `billing`, `storage`, `export`, `import` | Added per tier |
| Global flags seed | Wrong keys/group (`enable_ai`, no group) | `FEATURE_FLAGS` group, matching keys |
| Admin UI | API + service only | Unchanged (gap documented) |

---

## 1. Architecture Overview

### Intended Evaluation Order

Per `Docs/feature_flags.md`:

1. **Global kill switch** — `platform_settings` where `group = 'FEATURE_FLAGS'` and `value = false`
2. **Tenant override** — `tenants.overrides.features[featureKey]`
3. **Plan feature** — `plan_features` via active `subscriptions`
4. **Default** — `false`

### Runtime Flow

```
HTTP Request
  → JwtAuthGuard (@Public bypass)
  → TenantGuard
  → RolesGuard
  → PermissionGuard (@ResourcePermissions / auto resource:action)
  → PlanGuard (@PlanFeature check via PricingService.isFeatureEnabled)
  → LimitGuard (@Limit check)
  → Controller
```

### Separation of Concerns

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| Feature gating | `@PlanFeature('key')` + `PlanGuard` | Module/plan access |
| Permission gating | `@ResourcePermissions('crm')` + `PermissionGuard` | RBAC within allowed features |
| Usage limits | `@Limit('contacts')` + `LimitGuard` | Quota enforcement |

Both feature and permission checks must pass independently.

---

## 2. Database Schema

### Tables Used

| Table | Role | Status |
|-------|------|--------|
| `plan_features` | Plan → feature mapping | ✅ Used at runtime |
| `subscriptions` | Tenant → active plan | ✅ Used at runtime |
| `tenants.overrides` (JSONB) | Per-tenant feature overrides | ✅ Now used at runtime |
| `platform_settings` (`FEATURE_FLAGS`) | Global kill switches | ✅ Now used at runtime |
| `platform_settings` (`FEATURE_RULES`) | Admin UI toggles (AI/SMS/voice beta) | ⚠️ Separate from runtime `@PlanFeature` |

**Note:** The dedicated `feature_flags` / `tenant_feature_overrides` tables described in design docs were not implemented. The system uses `platform_settings` + `tenants.overrides` instead — functionally equivalent when wired correctly.

### Feature Keys in Use (Controllers)

| Key | Controllers |
|-----|-------------|
| `crm` | `crm.controller.ts` |
| `analytics` | `analytics-dashboards`, `analytics-reports` |
| `workflow` | `workflow.controller`, `workflow-meta.controller` |
| `ai` | `ai.controller`, agents, conversations, knowledge-bases, fine-tuning |
| `voice` | `voice.controller` |
| `whatsapp` | `whatsapp.controller` |
| `billing` | `billing.controller`, `monetization.controller` |
| `storage` | `backup.controller` |
| `export` | `export.controller` |
| `import` | `import.controller` |

---

## 3. Backend API — CRUD Audit

### 3.1 Plan Features (`/admin/features`)

| Method | Route | Status |
|--------|-------|--------|
| GET | `/admin/features` | ✅ List all plan features |
| POST | `/admin/features` | ✅ Create plan feature |
| PATCH | `/admin/features/:id` | ✅ Update |
| DELETE | `/admin/features/:id` | ✅ Delete |

**Guard:** `JwtAuthGuard`, `RolesGuard`, `@Roles('SUPER_ADMIN')`, `@ResourcePermissions('admin')`

### 3.2 Global & Tenant Flags (`/admin/feature-flags`)

| Method | Route | Status |
|--------|-------|--------|
| GET | `/admin/feature-flags/global` | ✅ List global flags |
| POST | `/admin/feature-flags/global` | ✅ Upsert global flag |
| GET | `/admin/feature-flags/tenant/:tenantId` | ✅ Get tenant overrides |
| PATCH | `/admin/feature-flags/tenant/:tenantId` | ✅ Set tenant override |

**Gap:** No DELETE endpoint for global or tenant flags. Upsert-only is acceptable for kill switches.

### 3.3 Related Override APIs

| Module | Route | Purpose |
|--------|-------|---------|
| `AdminTenantOverrideModule` | `/admin/tenants/:id/overrides` | Full override blob (features + limits) |
| `AdminPlanOverrideModule` | `/admin/settings/plan-overrides` | Global plan overrides (not wired to runtime) |
| `AdminFeatureRulesModule` | `/admin/settings/feature-rules` | Platform rules (AI/SMS/voice/beta toggles) |
| `TenantController` | `/admin/tenants/:id/overrides` | Duplicate tenant override path |

**Gap:** `AdminPlanOverrideModule` settings are stored but not consumed by `PricingService.isFeatureEnabled`.

### 3.4 Monetization / Billing

Plan feature management also exposed via `MonetizationController` (`/monetization/plans/:id/features`) for super-admin plan editing.

---

## 4. Runtime Guards Audit

### 4.1 PlanGuard ✅ (Primary Enforcer)

**File:** `backend/src/common/guards/plan.guard.ts`

- Reads `@PlanFeature` metadata (`METADATA_KEYS.PLAN_FEATURE`)
- Bypasses for `@Public()` routes
- Bypasses for `SUPER_ADMIN` role
- Calls `PricingService.isFeatureEnabled()`
- Returns 403 with `PLAN_FEATURE_DISABLED` error code

### 4.2 FeatureGuard ⚠️ (Removed from Global Registration)

**File:** `backend/src/common/guards/feature.guard.ts`

**Issues found:**
- Registered globally alongside `PlanGuard` → double evaluation on every `@PlanFeature` route
- Ran **before** `PlanGuard`, blocking `SUPER_ADMIN` bypass
- Returned `false` (silent deny) when `tenantId` missing instead of deferring

**Fix applied:**
- Removed from `APP_GUARD` in `app.module.ts`
- Aligned implementation with `PlanGuard` for optional explicit `@UseGuards(FeatureGuard)` usage

### 4.3 PermissionGuard ✅ (Independent)

**File:** `backend/src/common/guards/permission.guard.ts`

- Maps HTTP methods to actions (`GET` → `read`, `POST` → `create`, etc.)
- Resolves `@ResourcePermissions('crm')` → `crm:read`, `crm:create`, etc.
- Supports `:manage` and `:view` aliases
- Does **not** interact with feature flags (by design)

**Gap:** Not all controllers have `@ResourcePermissions`; permission seed coverage is partial (documented in security audit).

### 4.4 LimitGuard ✅

Registered globally. Enforces `@Limit` metadata separately from feature flags.

---

## 5. PricingService — Core Evaluation

**File:** `backend/src/modules/pricing/pricing.service.ts`

### Issue (Critical)

`isFeatureEnabled()` previously only checked `plan_features` via subscription. Admin APIs for global flags and tenant overrides had **no effect** on runtime access.

### Fix Applied

```typescript
async isFeatureEnabled(tenantId, featureKey):
  1. Check platform_settings (group=FEATURE_FLAGS, key=featureKey) → if disabled, return false
  2. Check tenant.overrides.features[featureKey] → if present, return that boolean
  3. Check plan_features via active subscription → return enabled or false
  4. Default false
```

**Dependencies added:** `Tenant` and `PlatformSetting` repositories in `MonetizationModule`.

**Not implemented (future):** Redis caching per `Docs/feature_runtime.md` (`feature:{tenantId}:{featureKey}`, 5-min TTL).

---

## 6. Seed Data Audit

### Plan Features (`backend/src/scripts/seed.ts`)

**Issue:** Controller feature keys `billing`, `storage`, `export`, `import` were absent from seeded plans, causing 403 on those modules even for Enterprise demo tenants (Enterprise had most modules but not billing/storage/export/import).

**Fix:** Added features per tier:

| Plan | Features |
|------|----------|
| Free | crm, analytics, billing |
| Starter | + workflow, whatsapp, export |
| Pro | + ai, voice, plugins, storage, import |
| Enterprise | + marketplace (all keys) |

### Global Feature Flags Seed

**Issue:** Legacy keys (`enable_ai`, `enable_voice`) without `FEATURE_FLAGS` group did not match runtime lookup or `@PlanFeature` keys.

**Fix:** Seed all 12 runtime feature keys under `group: 'FEATURE_FLAGS'` with `value: true`.

### E2E Test Seed

`backend/test/e2e/helpers/seed-test.helper.ts` already includes full `E2E_PLAN_FEATURES` list — no change needed.

---

## 7. Frontend / Admin UI Audit

| Component | Status |
|-----------|--------|
| `admin-feature-flags.service.ts` | ✅ API client for global + tenant flags |
| `admin-features.service.ts` | ✅ API client for plan feature CRUD |
| `admin-feature-rules.service.ts` | ✅ API client for feature rules |
| Dedicated feature flags admin page | ❌ **Missing** — no route under `/admin` or `/superadmin` |
| SuperAdmin dashboard | ⚠️ Mentions feature flags in copy only; buttons are non-functional |

**Recommendation:** Add `/admin/settings/feature-flags` page consuming `adminFeatureFlagsService` and `adminFeaturesService`.

---

## 8. Permission Mapping vs Feature Keys

Features and permissions use **different namespaces**:

| Feature Key | Related Permission Resource |
|-------------|----------------------------|
| `crm` | `crm:*` |
| `ai` | `ai:*` |
| `voice` | `voice:*` |
| `whatsapp` | `whatsapp:*` |
| `billing` | `billing:*` |
| `analytics` | `analytics:*` |
| `workflow` | `workflow:*` |

A tenant on a plan **without** `ai` feature gets 403 from `PlanGuard` before permission checks matter. A tenant **with** the feature still needs `ai:read` (or `:manage`) from `PermissionGuard`.

**No automatic mapping exists** between feature keys and permissions — both decorators must be applied on controllers (current pattern is correct).

---

## 9. Issues Fixed in This Audit

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | `isFeatureEnabled` ignored global flags and tenant overrides | Critical | Full hierarchy in `PricingService` |
| 2 | Duplicate `FeatureGuard` + `PlanGuard` global registration | High | Removed `FeatureGuard` from `APP_GUARD` |
| 3 | `SUPER_ADMIN` blocked by `FeatureGuard` before `PlanGuard` bypass | High | Resolved by #2 |
| 4 | Seed missing feature keys used by controllers | High | Updated plan features in `seed.ts` |
| 5 | Global flags seed used wrong keys/group | Medium | Aligned with `FEATURE_FLAGS` group |
| 6 | `FeatureGuard` inconsistent with `PlanGuard` | Medium | Aligned guard logic |
| 7 | `AdminFeatureFlagsService` didn't enforce group on update | Low | Set `group: 'FEATURE_FLAGS'` on upsert |

---

## 10. Remaining Gaps (Not Fixed)

| Gap | Priority | Notes |
|-----|----------|-------|
| No admin UI page for feature flags | Medium | API ready, frontend page needed |
| No Redis cache for feature resolution | Low | Performance optimization |
| `AdminPlanOverrideModule` not wired to runtime | Low | Stored in `platform_settings` but unread |
| `FEATURE_RULES` separate from `@PlanFeature` | Info | By design — platform-wide toggles vs plan gating |
| No integration tests for feature hierarchy | Medium | E2E seed has features; no dedicated test suite |
| Percentage rollout / tenant whitelist (`type`, `rules`) | Low | Designed but not implemented |

---

## 11. Verification Checklist

- [x] Global kill switch disables feature for all tenants
- [x] Tenant override takes precedence over plan feature
- [x] Plan feature gates module access when no override
- [x] Deny by default when no subscription or plan feature
- [x] SUPER_ADMIN bypasses plan feature checks
- [x] `@Public()` routes bypass plan feature checks
- [x] Admin CRUD APIs for plan features and flags respond correctly
- [x] Seed data covers all controller `@PlanFeature` keys for Enterprise demo
- [ ] Admin UI for feature flag management
- [ ] Redis caching layer
- [ ] Automated tests for evaluation hierarchy

---

## 12. Files Modified

| File | Change |
|------|--------|
| `backend/src/modules/pricing/pricing.service.ts` | Full evaluation hierarchy |
| `backend/src/modules/monetization.module.ts` | Added Tenant + PlatformSetting repos |
| `backend/src/app.module.ts` | Removed duplicate FeatureGuard from APP_GUARD |
| `backend/src/common/guards/feature.guard.ts` | Aligned with PlanGuard behavior |
| `backend/src/scripts/seed.ts` | Plan features + global flags aligned |
| `backend/src/modules/admin/feature-flags/admin-feature-flags.service.ts` | Enforce FEATURE_FLAGS group on upsert |
| `backend/src/common/decorators/plan-feature.decorator.ts` | Updated doc comment |
