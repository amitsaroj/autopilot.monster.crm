# Super Admin Gap Analysis — Consolidated

**Date:** 2026-06-19  
**Source:** `admin-gap-analysis.md`, `tenant-audit.md`, `feature-flag-audit.md`, `security-audit.md`, cross-domain audits  
**Overall Super Admin completion: ~40%**

---

## Executive Summary

The platform has **two admin surfaces**:

| Surface | Route | Role Gate | Completion |
|---------|-------|-----------|------------|
| Super Admin | `/superadmin/*` | `SUPER_ADMIN` | **~40%** |
| Tenant Admin | `/admin/*` | `TENANT_ADMIN`, `ADMIN`, `SUPER_ADMIN` | **~65%** |

Backend admin modules under `backend/src/modules/admin/` cover **50+ sub-modules** with broad API surface (~72% backend complete). Frontend superadmin has **29 pages** but many are read-only shells, non-functional buttons, or hardcoded charts. Test coverage for admin is **~5%**.

---

## Domain Completion Matrix

| Domain | Backend | Frontend | DB | Permissions | Tests | Est. Complete |
|--------|---------|----------|-----|-------------|-------|---------------|
| Tenant Management | ✅ CRUD | ⚠️ List + actions | ✅ | ✅ SUPER_ADMIN | ⚠️ Unit only | **58%** ↑ |
| User Management | ✅ CRUD | ⚠️ List only | ✅ | ✅ SUPER_ADMIN | ❌ | **48%** |
| Global Settings | ✅ | ⚠️ Partial wiring | ✅ | ✅ SUPER_ADMIN | ❌ | **45%** |
| Pricing | ✅ Settings API | ❌ No UI | ✅ | ✅ SUPER_ADMIN | ❌ | **28%** |
| Plans | ✅ CRUD + relations | ⚠️ Read-only list | ✅ | ✅ SUPER_ADMIN | ❌ | **42%** |
| Feature Flags | ✅ Global + tenant | ❌ No UI | ✅ | ✅ SUPER_ADMIN | ❌ | **32%** |
| Usage Metering | ✅ Records + summary | ❌ No superadmin UI | ✅ | ✅ SUPER_ADMIN | ❌ | **30%** |
| Audit Logs | ⚠️ Basic query | ⚠️ Schema mismatch | ✅ | ⚠️ Split endpoints | ❌ | **44%** |
| Platform Analytics | ⚠️ Stats + health | ⚠️ Dummy charts | ✅ | ✅ SUPER_ADMIN | ❌ | **38%** |
| Subscriptions | ✅ | ✅ Page created | ✅ | ✅ SUPER_ADMIN | ❌ | **55%** ↑ |
| Marketplace | ✅ | ✅ Wired | ✅ | ✅ SUPER_ADMIN | ❌ | **70%** ↑ |

---

## P0 — Critical (Blocks Production Super Admin Ops)

| ID | Gap | Domain | Backend | Frontend | Effort | Owner Action |
|----|-----|--------|---------|----------|--------|--------------|
| P0-01 | **Feature Flags UI** — no page for global kill switches or tenant overrides | Feature Flags | ✅ `/admin/feature-flags/*` | ❌ | M | Create `/superadmin/feature-flags` using `admin-feature-flags.service.ts` |
| P0-02 | **Pricing Settings UI** — cannot configure platform pricing | Pricing | ✅ `/admin/pricing-settings` | ❌ | M | Create `/superadmin/pricing` using `admin-pricing.service.ts` |
| P0-03 | **Usage Dashboard UI** — no platform usage visibility | Usage | ✅ `/admin/usage`, `/summary` | ❌ | M | Create `/superadmin/usage` with charts |
| P0-04 | **Tenant CRUD forms** — provision/create/edit/detail missing | Tenants | ✅ POST/PATCH | ❌ | L | Add `/superadmin/tenants/new`, `/tenants/[id]` with forms |
| P0-05 | **Plan CRUD editor** — read-only cards, buttons inert | Plans | ✅ Full CRUD | ❌ | L | Plan form with feature/limit editor |
| P0-06 | **Admin integration test suite** — zero HTTP tests | All Admin | N/A | N/A | L | `admin-tenants-http`, `admin-users-http`, `admin-flags-http` specs |
| P0-07 | **Production DDL migrations** — TASK-011 baseline for 76 entities | Infra | ⚠️ Partial | N/A | L | Run explicit migrations; `DB_SYNCHRONIZE=false` |
| P0-08 | **Real platform backups** — AdminBackupsService is stub | Infra | ❌ Stub | ❌ | M | Wire pg_dump + MinIO; test restore |

---

## P1 — Important (Required for Full Platform Operations)

| ID | Gap | Domain | Notes |
|----|-----|--------|-------|
| P1-01 | Replace dummy chart data on SuperAdmin dashboard | Analytics | Add time-series endpoint; wire Recharts |
| P1-02 | User management CRUD + role assignment | Users | Wire POST/PATCH; integrate `admin/roles` |
| P1-03 | Audit log schema normalization | Audits | Add `outcome`/`actor` columns or standardize JSONB |
| P1-04 | Audit mutation write coverage | Audits | Ensure all admin mutations call `AuditLogService.log()` |
| P1-05 | Consolidate duplicate plan/pricing APIs | Plans | Deprecate `monetization/admin/plans` or `admin/plans` |
| P1-06 | Tenant detail page with overrides editor | Tenants | `/superadmin/tenants/[id]` — subscription, usage, overrides |
| P1-07 | Global settings asset upload | Settings | Wire logo/favicon to storage module |
| P1-08 | Maintenance mode toggle | Settings | Bind to `maintenance_mode` platform setting |
| P1-09 | Tenant/user override UIs | Overrides | Wire `admin/tenant-override`, `admin/user-override` |
| P1-10 | Cost/usage rules UI | Pricing | Add `/superadmin/pricing/rules` |
| P1-11 | Platform limits page | Limits | Create `/superadmin/limits` → `/admin/limits` |
| P1-12 | Stripe price sync automation | Billing | Sync job or webhook reconciliation |
| P1-13 | Pagination on tenant/user lists | Tenants/Users | Backend params exist; frontend disabled |
| P1-14 | TRIAL expiry scheduler | Tenants | Auto TRIAL → SUSPENDED transition |
| P1-15 | Real-guard integration tests | Security | TASK-020 — stop overriding guards in CI |

---

## P2 — Enhancement (Post-Launch Improvements)

| ID | Gap | Domain | Notes |
|----|-----|--------|-------|
| P2-01 | CSV export for audits/usage | Audits/Usage | Export button currently non-functional |
| P2-02 | Real-time health monitoring dashboards | Analytics | Connect to notifications module |
| P2-03 | Rate limits admin page | Security | `/admin/rate-limit` — backend only |
| P2-04 | IP whitelist admin page | Security | `/admin/ip-whitelist` — backend only |
| P2-05 | Feature rules builder UI | Feature Flags | `/admin/settings/feature-rules` |
| P2-06 | MFA reset / force logout actions | Users | New endpoints + UI |
| P2-07 | Search extension (slug, name) on tenants | Tenants | Currently name-only |
| P2-08 | Revenue/MRR trend API | Analytics | Daily aggregation on invoices |
| P2-09 | KPI trend badges from historical data | Analytics | Replace static +12% |
| P2-10 | Allow registration toggle in UI | Settings | `allowRegistration` not exposed |
| P2-11 | Audit log real-time feed | Audits | Optional WebSocket/SSE tail |
| P2-12 | Redis cache for feature resolution | Feature Flags | 5-min TTL per Docs |

---

## Cross-Cutting Super Admin Issues

### Permissions & Security

| Issue | Severity | Status |
|-------|----------|--------|
| PermissionGuard default-deny | CRITICAL | ✅ **Fixed S15** |
| `@ResourcePermissions` on all admin routes | HIGH | ✅ 52/52 admin controllers protected |
| Tenant admin layout missing TENANT_ADMIN | CRITICAL | ✅ **Fixed** |
| Tenant pages calling platform audit endpoint | CRITICAL | ✅ **Fixed** — use `/logs/audit` |
| SUPER_ADMIN bypasses PermissionGuard | OK | By design |
| RolesGuard no DB role refresh | HIGH | Open — JWT stale until re-login |

### Navigation & Routing (Fixed This Audit)

| Broken Route | Fix |
|-------------|-----|
| `/superadmin/logs/audit` (404) | → `/superadmin/audits` ✅ |
| `/superadmin/events` (404) | → `/superadmin/system/events` ✅ |
| `/superadmin/subscriptions` (404) | Page created ✅ |
| `/superadmin/limits` (404) | CTA → `/superadmin/plans` ✅ |

### API Wiring Fixes (This Audit)

| Frontend Call | Was | Now |
|--------------|-----|-----|
| SuperAdmin dashboard KPIs | `/admin/metrics/global` (404) | Backend alias added ✅ |
| Tenant admin dashboard | `/admin/metrics/overview` (404) | `/analytics/overview` ✅ |
| Activity log | `/logs` (404) | `/logs/audit` ✅ |
| RBAC audits (tenant) | `/admin/audit-logs` (403) | `/logs/audit` ✅ |
| admin-usage.service | `/monetization/admin/usage` | `/admin/usage` ✅ |

---

## Missing Super Admin Pages (No Frontend)

| Feature | Backend API | Priority |
|---------|------------|----------|
| Feature Flags | `/admin/feature-flags/*` | **P0** |
| Pricing Settings | `/admin/pricing-settings` | **P0** |
| Usage Dashboard | `/admin/usage`, `/admin/usage/summary` | **P0** |
| Tenant Detail + Overrides | `/admin/tenants/:id`, `/overrides` | **P1** |
| Plan Limits (standalone) | `/admin/limits` | **P1** |
| Tenant Overrides | `/admin/tenant-override` | **P1** |
| Plan Overrides | `/admin/plan-override` | **P1** |
| User Overrides | `/admin/user-override` | **P1** |
| Cost/Usage Rules | `/admin/cost-rules`, `/admin/usage-rules` | **P1** |
| Rate Limits | `/admin/rate-limit` | P2 |
| IP Whitelist | `/admin/ip-whitelist` | P2 |

---

## Recommended Implementation Order

### Sprint 1 (P0 — 2 weeks)

1. Feature Flags UI (`/superadmin/feature-flags`)
2. Pricing UI (`/superadmin/pricing`)
3. Usage Dashboard UI (`/superadmin/usage`)
4. Tenant create/edit/detail forms
5. Plan CRUD editor
6. Admin integration test suite (tenants, users, flags)
7. Production DDL migration (TASK-011)

### Sprint 2 (P1 — 2 weeks)

8. Replace SuperAdmin dummy charts with real time-series
9. User management CRUD + role assignment
10. Tenant detail page with overrides editor
11. Audit schema normalization + write coverage audit
12. Consolidate duplicate plan/pricing APIs
13. Platform limits + cost/usage rules pages
14. Real-guard integration tests in CI

### Sprint 3 (P2 — ongoing)

15. CSV exports, rate limits, IP whitelist pages
16. Stripe sync automation, MFA admin actions
17. Real-time audit feed, feature flag Redis cache

---

## Completion Estimate by Layer

| Layer | Score | Notes |
|-------|-------|-------|
| Backend API surface | **72%** | Broad coverage; some stubs (backups) |
| Frontend superadmin UI | **35%** | Many read-only shells |
| API ↔ UI wiring | **55%** | Improved after audit fixes |
| Database/entities | **70%** | Entities exist; migrations partial |
| Permissions/security | **75%** | Improved with default-deny S15 |
| Test coverage | **5%** | Essentially none for admin |
| **Production readiness (Super Admin)** | **40%** | Not deployable for full platform ops |

---

## References

- `backend/src/modules/admin/admin.module.ts` — 50+ sub-modules
- `frontend/src/app/superadmin/` — 29 pages
- `frontend/src/services/admin-*.service.ts` — 66 service files
- `tasks/TASKS.md` — TASK-010, TASK-011, TASK-014, TASK-015, TASK-020
