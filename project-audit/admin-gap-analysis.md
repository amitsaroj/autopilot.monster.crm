# Super Admin Architecture — Gap Analysis

**Audit date:** 2026-06-19  
**Auditor scope:** Tenant Management, User Management, Global Settings, Pricing, Plans, Feature Flags, Usage Metering, Audit Logs, Platform Analytics  
**Method:** Full-stack verification (frontend `/superadmin` + `/admin`, backend `admin/*`, entities, guards, tests). Pages alone do not count as complete.

---

## Executive Summary

| Domain | Backend | Frontend | DB | Permissions | Tests | Est. Complete |
|--------|---------|----------|-----|-------------|-------|---------------|
| Tenant Management | ✅ CRUD | ⚠️ List only | ✅ | ✅ SUPER_ADMIN | ❌ | **52%** |
| User Management | ✅ CRUD | ⚠️ List only | ✅ | ✅ SUPER_ADMIN | ❌ | **48%** |
| Global Settings | ✅ System/Email/Security | ⚠️ Partial wiring | ✅ | ✅ SUPER_ADMIN | ❌ | **45%** |
| Pricing | ✅ Settings API | ❌ No UI | ✅ | ✅ SUPER_ADMIN | ❌ | **28%** |
| Plans | ✅ CRUD + relations | ⚠️ Read-only list | ✅ | ✅ SUPER_ADMIN | ❌ | **42%** |
| Feature Flags | ✅ Global + tenant override | ❌ No UI | ✅ | ✅ SUPER_ADMIN | ❌ | **32%** |
| Usage Metering | ✅ Records + summary | ❌ No superadmin UI | ✅ | ✅ SUPER_ADMIN | ❌ | **30%** |
| Audit Logs | ⚠️ Basic query | ⚠️ Mismatched schema | ✅ | ⚠️ Split endpoints | ❌ | **44%** |
| Platform Analytics | ⚠️ Stats + health | ⚠️ Dummy charts | ✅ | ✅ SUPER_ADMIN | ❌ | **38%** |

**Overall Super Admin architecture completion: ~40%** (production-ready estimate)

---

## Architecture Overview

The platform has **two distinct admin surfaces**:

| Surface | Route prefix | Role gate | Purpose |
|---------|-------------|-----------|---------|
| **Super Admin** | `/superadmin/*` | `SUPER_ADMIN` only | Platform-wide control |
| **Tenant Admin** | `/admin/*` | `TENANT_ADMIN`, `ADMIN`, `SUPER_ADMIN` | Workspace-scoped management |

Backend admin modules live under `backend/src/modules/admin/` (50+ sub-modules). Frontend superadmin has **29 pages**; many are UI shells without full CRUD or with hardcoded/mock data.

---

## 1. Tenant Management

### What exists

**Backend** (`admin/tenants`):
- `GET/POST /admin/tenants`, `GET/PATCH/DELETE /admin/tenants/:id`
- Service: search by name, full CRUD on `Tenant` entity
- Guard: `@Roles('SUPER_ADMIN')`, `@ResourcePermissions('tenant')`

**Frontend** (`/superadmin/tenants`):
- List view with search debounce → `GET /api/v1/admin/tenants`
- Status badges, plan display
- "Provision Tenant" button is **non-functional** (no modal/form)
- Row actions (external link, menu) are **non-functional**
- Pagination UI disabled/placeholder

**Database:** `tenants` table via `Tenant` entity; supports `overrides.features` for per-tenant flag overrides.

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| T-01 | HIGH | No tenant create/edit/detail UI | Add `/superadmin/tenants/new`, `/superadmin/tenants/[id]` with forms wired to POST/PATCH |
| T-02 | HIGH | No suspend/activate workflow | Wire status PATCH + confirmation modals |
| T-03 | MEDIUM | Search only matches `name`, not slug/id | Extend `AdminTenantsService.findAll` with OR query on slug |
| T-04 | MEDIUM | No pagination (hard limit implicit) | Add `page`, `limit` query params + frontend pagination |
| T-05 | MEDIUM | Domain verification mocked (per TASK-018) | Implement real DNS verification in tenant service |
| T-06 | LOW | No dedicated limits UI (`/superadmin/limits` missing) | Create limits page wired to `GET/POST /admin/limits` |
| T-07 | CRITICAL | Zero admin HTTP/integration tests | Add `admin-tenants-http.integration.spec.ts` |

---

## 2. User Management

### What exists

**Backend** (`admin/users`):
- Full CRUD across all tenants
- Search by email, filter by `tenantId`
- Relations: `tenant`, `roles`

**Frontend** (`/superadmin/users`):
- Global user directory with search → `GET /api/v1/admin/users`
- Displays status, provider, MFA, tenant context
- Invite/create/edit/suspend buttons are **non-functional**

**Tenant admin overlap** (`/admin/users`):
- Separate tenant-scoped user page exists but uses different styling/copy
- RBAC audit references platform roles incorrectly for tenant context

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| U-01 | HIGH | No create/edit/invite flows on superadmin | Wire POST/PATCH to forms with validation |
| U-02 | HIGH | No role assignment UI at platform level | Integrate with `admin/roles` + `admin/user-override` |
| U-03 | MEDIUM | Search limited to email | Add firstName/lastName search in service |
| U-04 | MEDIUM | No MFA reset / force logout actions | Add endpoints + UI actions |
| U-05 | CRITICAL | No tests for cross-tenant user isolation | Add integration tests (TASK-021) |

---

## 3. Global Settings

### What exists

**Backend modules:**
- `admin/settings/system` — platform metadata (SYSTEM group in `platform_settings`)
- `admin/settings/email` — SMTP config
- `admin/settings/security` — security policies
- `admin/config`, `admin/environment` — infra config
- Root `admin/settings` — generic key/value platform settings

**Frontend:**
- `/superadmin/settings` — fetches/saves `GET/POST /admin/settings/system` ✅
- `/superadmin/settings/email` — wired ✅
- `/superadmin/settings/security` — wired ✅
- Logo/favicon upload UI is **placeholder only** (no upload API wired)

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| G-01 | HIGH | Frontend field mismatch (`appName` vs backend `platformName`) | Normalize DTO mapping in service or frontend adapter |
| G-02 | HIGH | Asset upload (logo/favicon) not implemented | Wire to storage module upload endpoint |
| G-03 | MEDIUM | Maintenance mode toggle not exposed in UI | Add toggle bound to `maintenance_mode` setting |
| G-04 | MEDIUM | No settings change audit trail | Log changes via `AuditLogService` on update |
| G-05 | LOW | `allowRegistration` not in UI | Add registration gate toggle |

---

## 4. Pricing

### What exists

**Backend** (`admin/pricing-settings`):
- `GET/POST /admin/pricing-settings` — stores key/value pairs in `platform_settings` group `PRICING`
- `admin/cost-rules`, `admin/usage-rules` — rule engines for billing calculations

**Frontend:**
- `admin-pricing.service.ts` exists with correct API paths
- **No superadmin page** for pricing configuration
- Plans page mentions Stripe sync but no pricing settings UI

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| P-01 | CRITICAL | No pricing management UI | Create `/superadmin/pricing` page using `admin-pricing.service.ts` |
| P-02 | HIGH | Cost/usage rules have backend only | Add `/superadmin/pricing/rules` UI |
| P-03 | MEDIUM | Duplicate plan APIs (`admin/plans` vs `monetization/admin/plans`) | Consolidate to single canonical controller |
| P-04 | HIGH | Stripe price sync is manual-only | Add sync job or webhook reconciliation |

---

## 5. Plans

### What exists

**Backend** (`admin/plans`):
- Full CRUD with `features` and `limits` relations
- Entity: `Plan`, `PlanFeature`, `PlanLimit`

**Frontend** (`/superadmin/plans`):
- Read-only plan cards from `GET /admin/plans`
- Edit/delete/configure buttons are **non-functional**
- "Define New Tier" button does nothing

**Also:** `monetization.controller.ts` exposes parallel SUPER_ADMIN plan/feature/limit endpoints under `monetization/admin/*`.

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| PL-01 | HIGH | No plan create/edit UI | Build plan form with feature/limit management |
| PL-02 | HIGH | PlanGuard not enforcing real billing checks (TASK-014) | Implement `PlanGuard` with `PricingService.isFeatureEnabled` |
| PL-03 | MEDIUM | Dual API surface causes confusion | Deprecate one controller set |
| PL-04 | MEDIUM | No plan archival workflow in UI | Wire status PATCH to ARCHIVED |
| PL-05 | LOW | Stripe price IDs display-only | Add Stripe link + validation |

---

## 6. Feature Flags

### What exists

**Backend** (`admin/feature-flags`):
- `GET/POST /admin/feature-flags/global` — stored in `platform_settings` group `FEATURE_FLAGS`
- `GET/PATCH /admin/feature-flags/tenant/:tenantId` — tenant overrides via `tenant.overrides.features`
- `admin/feature-rules` — rule-based feature gating

**Frontend:**
- `admin-feature-flags.service.ts` — fully wired service ✅
- **No superadmin page** for feature flag management
- Dashboard mentions feature flags but links nowhere

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| FF-01 | CRITICAL | No feature flags UI | Create `/superadmin/feature-flags` with global + per-tenant override panel |
| FF-02 | HIGH | `FeatureGuard` exists but plan feature checks incomplete | Complete PlanGuard integration (TASK-014) |
| FF-03 | MEDIUM | No flag audit/history | Log flag changes to audit_logs |
| FF-04 | MEDIUM | Feature rules module has no UI | Add rules builder page |

---

## 7. Usage Metering

### What exists

**Backend:**
- `admin/usage` — `GET /admin/usage`, `GET /admin/usage/summary`
- `UsageRecord` entity with metric, quantity, period, cost
- `monetization/admin/usage` — global usage via `BillingService.getGlobalUsage()`
- `admin/usage-rules`, `admin/cost-rules` — metering rule config

**Frontend:**
- `admin-usage.service.ts` — **fixed** to use `/admin/usage` and `/admin/usage/summary`
- Tenant billing page (`/admin/billing`) shows usage with hardcoded limits
- **No superadmin usage dashboard**

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| UM-01 | CRITICAL | No platform usage dashboard UI | Create `/superadmin/usage` with summary charts |
| UM-02 | HIGH | Tenant billing page uses hardcoded quotas (10000, 1000, 5000) | Fetch limits from plan via API |
| UM-03 | MEDIUM | No per-tenant usage drill-down | Add tenant filter + detail view |
| UM-04 | MEDIUM | Usage aggregation limited to 100 records | Add pagination + date range filters |
| UM-05 | LOW | No export/CSV for usage data | Add export endpoint |

---

## 8. Audit Logs

### What exists

**Backend — two separate endpoints:**

| Endpoint | Scope | Role |
|----------|-------|------|
| `GET /admin/audit-logs` | Platform-wide | SUPER_ADMIN |
| `GET /logs/audit` | Tenant-scoped | TenantGuard + JWT |

**Entity** (`audit_logs`): `tenantId`, `userId`, `action`, `resource`, `resourceId`, `changes` (jsonb), `ipAddress`, `userAgent`, `createdAt`

**Frontend:**
- `/superadmin/audits` — platform audit trail (enhanced query params added)
- `/admin/rbac/audits` — **fixed** to use tenant-scoped `/logs/audit`
- `/admin/settings/activity-log` — **fixed** from broken `/logs` to `/logs/audit`

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| A-01 | HIGH | Audit entity lacks `outcome`, `actor`, `actorRole` columns | Either extend entity or standardize `changes` jsonb schema |
| A-02 | HIGH | No pagination (hard cap 200) | Add cursor/page pagination |
| A-03 | MEDIUM | Export CSV button non-functional | Implement CSV export endpoint |
| A-04 | MEDIUM | Category filter uses action prefix heuristic | Add explicit `category` column or enum |
| A-05 | MEDIUM | No real-time/streaming audit feed | Optional: WebSocket or SSE for live tail |
| A-06 | CRITICAL | No audit log write coverage verification | Ensure all admin mutations call `AuditLogService.log()` |

---

## 9. Platform Analytics

### What exists

**Backend:**
- `GET /admin/metrics/stats` — tenants, users, subscriptions, revenue, usage
- `GET /admin/metrics/global` — **alias added** for frontend compat
- `GET /admin/metrics/health` — process uptime/memory
- `GET /admin/health` — detailed OS-level health (CPU, memory, platform)
- `admin/billing/stats` — billing-specific stats

**Frontend:**
- `/superadmin` dashboard — KPIs from API ✅, **charts use dummyChartData** ❌
- `/superadmin/metrics` — health from `/admin/health` ✅, **charts use dummySeries** ❌
- `/admin` tenant dashboard — **fixed** to use `/analytics/overview` (tenant-scoped)

### Gaps

| ID | Severity | Gap | Recommended Fix |
|----|----------|-----|-----------------|
| AN-01 | HIGH | Growth charts are hardcoded dummy data | Add time-series endpoint + wire Recharts |
| AN-02 | HIGH | Cluster resource percentages hardcoded on dashboard | Wire to `/admin/health` CPU/memory metrics |
| AN-03 | MEDIUM | No revenue/MRR trend API | Add daily aggregation query on invoices |
| AN-04 | MEDIUM | KPI trend badges (+12%, +48) are static | Compute from historical snapshots |
| AN-05 | LOW | No alerting/incident integration | Connect to notifications module |

---

## Cross-Cutting Issues

### Permissions & Security

| Issue | Severity | Status |
|-------|----------|--------|
| `PermissionGuard` registered globally but `@Permissions` not on all routes (TASK-010) | CRITICAL | Open |
| `RolesGuard` checks JWT roles array — no DB role refresh | HIGH | Open |
| Super admin layout validates JWT server-side ✅ | OK | Fixed pattern |
| Tenant admin layout missing `TENANT_ADMIN` | CRITICAL | **Fixed** |
| Admin audit endpoint called by tenant pages | CRITICAL | **Fixed** (tenant pages use `/logs/audit`) |
| SUPER_ADMIN bypasses PermissionGuard ✅ | OK | By design |

### Navigation & Routing

| Broken route | Fix applied |
|-------------|-------------|
| `/superadmin/logs/audit` (404) | Sidebar → `/superadmin/audits` ✅ |
| `/superadmin/events` (404) | Sidebar → `/superadmin/system/events` ✅ |
| `/superadmin/subscriptions` (404) | Page created ✅ |
| `/superadmin/limits` (404) | Tenants CTA → `/superadmin/plans` ✅ |

### API Wiring Mismatches (Fixed This Audit)

| Frontend call | Was | Now |
|--------------|-----|-----|
| Superadmin dashboard KPIs | `/admin/metrics/global` (404) | Backend alias `GET /admin/metrics/global` ✅ |
| Tenant admin dashboard | `/admin/metrics/overview` (404) | `/analytics/overview` ✅ |
| Activity log page | `/logs` (404) | `/logs/audit` ✅ |
| RBAC audits (tenant) | `/admin/audit-logs` (403 for tenant admin) | `/logs/audit` ✅ |
| `admin-usage.service` findAll | `/monetization/admin/usage` | `/admin/usage` ✅ |
| `admin-usage.service` getSummary | `/monetization/admin/usage` | `/admin/usage/summary` ✅ |

### Database

- Migrations exist: `InitialSchema`, `BaselineSchema`, `PlatformModulesSchema`, `ExtendedModulesSchema`
- Entities present: `Plan`, `PlanFeature`, `PlanLimit`, `UsageRecord`, `AuditLog`, `PlatformSetting`, `Tenant`, `Subscription`, `Invoice`
- TASK-011 (full baseline migration for 76 entities) still **pending**
- No seed data verification for default plans/feature flags

### Test Coverage

| Area | Status |
|------|--------|
| Admin module unit tests | ❌ None found |
| Admin HTTP integration tests | ❌ None found |
| Super admin E2E | ❌ None found |
| Cross-tenant isolation tests | ❌ TASK-021 pending |
| RBAC permission tests | ❌ TASK-010 pending |

Only references in `backend/test/e2e/helpers/seed-test.helper.ts` for SUPER_ADMIN seed user.

---

## Missing Super Admin Pages (No Frontend)

| Feature | Backend API | Priority |
|---------|------------|----------|
| Feature Flags | `/admin/feature-flags/*` | P0 |
| Pricing Settings | `/admin/pricing-settings` | P0 |
| Usage Dashboard | `/admin/usage`, `/admin/usage/summary` | P0 |
| Plan Limits (standalone) | `/admin/limits` | P1 |
| Tenant Overrides | `/admin/tenant-override` | P1 |
| Plan Overrides | `/admin/plan-override` | P1 |
| User Overrides | `/admin/user-override` | P1 |
| Rate Limits | `/admin/rate-limit` | P2 |
| IP Whitelist | `/admin/ip-whitelist` | P2 |

---

## Fixes Applied (2026-06-19)

1. **Backend:** Added `GET /admin/metrics/global` alias endpoint
2. **Backend:** Extended audit logs with `search`, `category`, `outcome` filters + response mapping
3. **Frontend:** Fixed tenant admin layout to allow `TENANT_ADMIN` role
4. **Frontend:** Fixed tenant admin dashboard API → `/analytics/overview`
5. **Frontend:** Fixed tenant RBAC audits → `/logs/audit` (tenant-scoped)
6. **Frontend:** Fixed activity log page → `/logs/audit`
7. **Frontend:** Fixed `admin-usage.service.ts` API paths
8. **Frontend:** Fixed sidebar broken superadmin navigation links
9. **Frontend:** Created `/superadmin/subscriptions` page wired to API
10. **Frontend:** Fixed tenants page dead link to non-existent `/superadmin/limits`

---

## Recommended Implementation Order

### P0 — Critical (blocks production)

1. Feature Flags UI (`/superadmin/feature-flags`)
2. Pricing UI (`/superadmin/pricing`)
3. Usage Dashboard UI (`/superadmin/usage`)
4. Tenant CRUD forms (create/edit/suspend)
5. Plan CRUD forms with feature/limit editor
6. Activate `@Permissions` on all admin routes (TASK-010)
7. Admin integration test suite

### P1 — Important

8. Replace all dummy chart data with real time-series APIs
9. User management CRUD + role assignment
10. Audit log schema normalization (outcome/actor columns)
11. PlanGuard real enforcement (TASK-014)
12. Consolidate duplicate plan/pricing APIs

### P2 — Enhancement

13. CSV export for audits/usage
14. Real-time health monitoring dashboards
15. Stripe sync automation
16. Platform settings asset upload

---

## Completion Estimate

| Layer | Score |
|-------|-------|
| Backend API surface | **72%** — broad coverage, some stubs |
| Frontend superadmin UI | **35%** — many read-only shells |
| API ↔ UI wiring | **50%** — improved after fixes |
| Database/entities | **70%** — entities exist, migrations partial |
| Permissions/security | **45%** — guards exist, not fully enforced |
| Test coverage | **5%** — essentially none |
| Production readiness | **40%** — not deployable for full super admin ops |

**Weighted overall: ~40% complete** for Super Admin architecture.

---

## References

- `tasks/TASKS.md` — TASK-010 (PermissionGuard), TASK-014 (PlanGuard), TASK-015 (admin mock pages)
- `project-audit/missing-apis.md` — broader API gaps
- `project-audit/security-report.md` — RBAC hardening
- Backend module index: `backend/src/modules/admin/admin.module.ts` (50+ sub-modules)
- Frontend superadmin: `frontend/src/app/superadmin/` (29 pages)
- Frontend services: `frontend/src/services/admin-*.service.ts` (66 files)
