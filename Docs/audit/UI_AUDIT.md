# UI AUDIT

**Audit date:** 2026-07-22  
**Agent:** 15 — Production Readiness Auditor (post Wave 4)  
**Stack:** Next.js App Router · **334 pages** · **2 Vitest files (5 tests)**

---

## Executive summary

| Metric | Value |
|--------|------:|
| Total pages | 334 |
| Admin/superadmin pages | ~80+ |
| Unauthenticated `fetch('/api/v1/...')` | **0** (fixed) |
| Mock/hardcoded hub pages (critical) | **0** (F-029 fixed) |
| Dead nav links | 3+ |
| FE test files | **2** (Vitest smoke) |
| Playwright E2E | **Not configured** |

**UI readiness:** ~**52%** · **0** pages meet full DoD.

---

## Wave 4 frontend fixes

| Page | Before | After | APIs |
|------|--------|-------|------|
| `(app)/ai` | ⚫ Hardcoded KPIs | 🟡 Live usage | `GET /ai/usage` with loading/error/empty |

---

## Waves 1–3 frontend fixes (Agent 02, 11)

| Page | Before | After | APIs |
|------|--------|-------|------|
| `(app)/dashboard` | ⚫ Hardcoded KPIs | 🟡 Live metrics | analytics + CRM activities/tasks |
| `(app)/inbox` | ⚫ Mock threads | 🟡 Live list | omnichannel → WA fallback |
| `(app)/search` | ⚫ Static results | 🟡 Live search | `GET /search` |
| `(app)/import` | ⚫ No service | 🟡 Job history + upload | import/storage APIs |
| `(app)/export` | ⚫ No service | 🟡 Job history + export | export/backup APIs |
| `admin/page` | 🟡 Fake trends | 🟡 Real overview fields | analytics overview |
| `admin/billing` | 🟡 Wrong endpoints | 🟡 Fixed paths/metrics | monetization APIs |
| `(app)/analytics/export` | 🟡 CSV only | 🟡 PDF + CSV | `GET /analytics/export-pdf` |

**New services:** `analytics.service.ts`, `omnichannel.service.ts`

---

## Remaining misleading / partial UI

| Page | Status | Evidence |
|------|--------|----------|
| `admin/rbac` | 🟡 Misleading | Hardcoded user/role/permission counts |
| `(app)/billing` (tenant) | 🟡 Partial | Usage metric keys may not match backend |
| `(app)/marketplace/*` | 🟡 Partial | Plugin APIs wired; no templates UI (F-035 BE only) |
| Developer settings | 🟡 Partial | `developer-settings.service.ts` vs `developer.service.ts` — no dedicated `/developer` route |

---

## Missing routes (dead nav)

| Route | Linked from | Status |
|-------|-------------|--------|
| `/billing/plans` | Sidebar | 🔴 No `page.tsx` (F-033) |
| `/settings/data` | Settings hub | 🔴 No `page.tsx` (F-061) |
| `/admin/whatsapp/*` children | Admin WA hub | 🔴 Dead links (BL-H14) |
| `(app)/marketplace/templates` | — | 🔴 No page (BE ready) |
| `(app)/developer` | — | 🔴 No dedicated hub |

---

## Pagination UX (F-062)

| List page | Server pagination | Current behavior |
|-----------|-------------------|------------------|
| CRM contacts | BE ready | Full array + client filter |
| CRM companies | BE ready | Full array |
| CRM leads | BE ready | Full array |
| CRM deals | BE ready | Full array |
| Admin users | 🟡 Partial | Full array |

**Blocker:** No shared `<Pagination>` component; FE services don't pass `page`/`limit`.

---

## Frontend testing (BL-C10)

| Check | Status |
|-------|--------|
| Vitest configured | ✅ `vitest.config.ts` |
| Smoke tests | ✅ 5 tests (api client + utils) |
| CI wired | ✅ `ci.yml` frontend job runs `npm test` |
| `@testing-library/react` | ❌ Not added |
| Playwright | ❌ Not configured |
| Admin page smoke | ❌ None |

**Verdict:** 🟡 Partial — foundation only.

---

## Responsive / loading / error patterns

| Pattern | Coverage |
|---------|----------|
| Loading spinners on wired hubs | 🟡 Dashboard, inbox, search, AI hub |
| Error retry states | 🟡 AI hub, dashboard |
| Empty states | 🟡 AI hub |
| Consistent toast (dual providers) | 🟡 BL-M08 open |

---

## UI sign-off blockers

1. Playwright baseline (login → dashboard → CRM list)  
2. FE pagination component + CRM list adoption  
3. Dead nav removal or page creation (F-033, F-061)  
4. RBAC admin page real data  
5. Marketplace templates + developer dedicated pages  

**UI sign-off:** Not ready for production.
