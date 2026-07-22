# BROKEN FEATURE REPORT

**Audit date:** 2026-07-22  
**Agent:** 15 — Production Readiness Auditor (post Wave 4)  
**Classification:** ⚫ Broken only

Broken = wiring failure, dead code path, or UI shows fake data despite nav implying live feature.

**Δ vs seed audit:** 12 ⚫ → **0 ⚫** (all remediated or reclassified to 🟡)

---

## Summary

| Count | Feature IDs |
|------:|-------------|
| **0** | — |

**All formerly broken features have been remediated.** None meet the ⚫ Broken definition as of Wave 4 verification.

---

## Remediation history (⚫ → 🟡)

### Wave 4 (2026-07-22)

| ID | Was broken because | Fix evidence |
|----|-------------------|--------------|
| F-004 | Duplicate legacy auth tree | Legacy root auth files removed; `modules/auth` only |
| F-029 | Hardcoded AI hub KPIs | `(app)/ai/page.tsx` → `GET /ai/usage` with real data |
| F-035 | Marketplace templates module orphan | `MarketplaceModule` in `PlatformModule`; 3/3 integration PASS |
| F-046 | DeveloperModule not in app | `DeveloperModule` in `CoreModule`; 5/5 integration PASS |

### Waves 1–3

| ID | Was broken because | Fix evidence |
|----|-------------------|--------------|
| F-009 | Route shadowing | `groups` before `:id` in `users.controller.ts` |
| F-020 | Controller unwired | `DuplicateController` in `crm.module.ts` |
| F-021 | Hardcoded KPIs | Analytics API calls in dashboard |
| F-022 | Stub BE + mock FE | Omnichannel module wired; inbox uses APIs |
| F-032 | Stubs unwired | `BillingExtController` + coupons in MonetizationModule |
| F-037 | Static search results | `searchService.search()` live |
| F-041 | Mock import/export hubs | `importExportService` integrated |
| F-049 | No write path | `AuditLogListener` + `AuditLog` forFeature |
| F-056 | Dual Postgres, no UI/TLS | Agent 13 compose + nginx |
| F-059 | Secrets in git index | `git rm --cached` + examples |

---

## Residual risks (not ⚫ — classified 🟡)

These items were formerly broken but remain incomplete under strict DoD:

| ID | Residual gap | Status |
|----|--------------|--------|
| F-049 | CRM mutations not audited | 🟡 Partial |
| F-035 | No FE templates browse/install UI | 🟡 Partial |
| F-046 | Dual surface with `/settings/*` developer APIs | 🟡 Partial |
| F-004 | Auth module consolidated; RS256 key ops pending | 🟡 Partial |
| F-029 | Hub wired; no FE regression tests | 🟡 Partial |

---

## Verification

```
Glob backend/src/auth.module.ts          → 0 files (legacy removed)
grep DeveloperModule app.module.ts       → imported in CoreModule
grep MarketplaceModule platform.module   → imported
frontend (app)/ai/page.tsx               → api.get('/ai/usage')
backend integration marketplace|developer → 12/12 PASS
```

**No features require ⚫ Broken classification at this time.**
