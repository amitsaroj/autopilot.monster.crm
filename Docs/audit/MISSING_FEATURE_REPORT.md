# MISSING FEATURE REPORT

**Audit date:** 2026-07-22  
**Agent:** 15 — Production Readiness Auditor (post Wave 4)  
**Classification:** 🔴 Missing only (3 features)

Strict DoD: feature has no meaningful implementation or route surface exists but page/module is absent.

**Δ vs seed:** 4 🔴 → **3 🔴** (F-054 reclassified 🟡 Partial — Vitest scaffold exists)

---

## Summary

| Count | Feature IDs |
|------:|-------------|
| **3** | F-033, F-061, F-062 |

---

## F-033 — Billing plans page (`/billing/plans`)

| Field | Detail |
|-------|--------|
| Module | Billing / Frontend |
| Priority | Medium |
| Evidence | Sidebar link in `sidebar.tsx`; **no** `frontend/src/app/**/billing/plans/page.tsx` (glob verified) |
| Backend | Plans API exists via `/monetization/plans` |
| Blocker | Frontend route never created |
| Owner | Frontend |

---

## F-061 — Settings data page (`/settings/data`)

| Field | Detail |
|-------|--------|
| Module | Settings / Frontend |
| Priority | Medium (BL-H14) |
| Evidence | Linked from settings hub; **no** `settings/data/page.tsx` |
| Backend | Import/export APIs exist (F-040 partial) |
| Blocker | Dead nav link |
| Owner | Frontend |

---

## F-062 — App-wide list pagination (FE UX)

| Field | Detail |
|-------|--------|
| Module | Frontend / CRM |
| Priority | High (BL-H01) |
| Evidence | BE opt-in pagination on contacts/companies/leads/deals/tasks/products/quotes (`CrmListQueryDto`, `toPaginatedResult`) — **FE list pages still load full arrays** with client-side filter only |
| Backend | 🟡 Partial — opt-in `?page=&limit=&search=` |
| Blocker | No shared pagination component; FE not passing query params |
| Owner | Frontend + CRM |
| Effort | L |

---

## Reclassified from 🔴 Missing → 🟡 Partial

| ID | Feature | Reason |
|----|---------|--------|
| F-054 | Frontend automated tests | Vitest + jsdom scaffold; 2 spec files · 5 tests PASS; wired in `ci.yml`. Playwright + component tests still absent — not 🔴 Missing |

---

## Impact

These three gaps block production readiness for:

1. **Monetization UX** — tenants cannot browse plans in-app  
2. **Settings completeness** — broken nav erodes trust  
3. **Scale** — large tenant datasets will OOM/slow lists without server pagination  

F-054 (FE tests) moved to Partial — foundation exists but DoD requires Playwright baseline + admin smoke coverage.

None qualify for ✅ until implemented end-to-end with tests.
