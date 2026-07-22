# FEATURE COVERAGE MATRIX

**Audit date:** 2026-07-22  
**Agent:** 15 — Production Readiness Auditor (Step 8/10, post Wave 4)  
**Evidence:** All agent reports (02–14) + live verification: `npm run build` PASS · backend 234/234 tests PASS · frontend Vitest 5/5 PASS · 0 `fetch('/api/v1/...')` in admin

Legend: ✅ Complete · 🟡 Partial · 🔴 Missing · ⚫ Broken · — N/A

**Strict DoD:** Backend + DB + Migration + API + Frontend connected + Validation + Permissions + Audit logging + Error handling + Unit tests + Integration tests + Production ready.

---

## Global status (62 features)

| Status | Count | Δ vs seed |
|--------|------:|----------:|
| ✅ Complete | **0** | 0 |
| 🟡 Partial | **59** | +13 |
| 🔴 Missing | **3** | −1 |
| ⚫ Broken | **0** | −12 |
| **Total** | **62** | — |

**Mean completion (unweighted):** ~**54%** (was ~46%)  
**Product-critical mean (Auth/CRM/Billing/Comms):** ~**60%**  
**DoD-complete features:** **0**

---

## Domain coverage

| Domain | Features | ✅ | 🟡 | 🔴 | ⚫ | Avg % | Top blockers |
|--------|--------:|--:|--:|--:|--:|------:|--------------|
| Auth & Users | 6 | 0 | 6 | 0 | 0 | 58 | CRM audit gaps |
| Tenant & RBAC | 3 | 0 | 3 | 0 | 0 | 68 | FE RBAC hub fake stats (BL-C11) |
| CRM core | 12 | 0 | 12 | 0 | 0 | 64 | FE pagination; duplicate merge UI |
| Omnichannel / Inbox | 1 | 0 | 1 | 0 | 0 | 48 | EMAIL/VOICE send stubs |
| WhatsApp | 2 | 0 | 2 | 0 | 0 | 67 | Live Meta creds; per-tenant WABA |
| Voice | 1 | 0 | 1 | 0 | 0 | 72 | Campaign dialer; STT/TTS stubs |
| AI / RAG | 4 | 0 | 4 | 0 | 0 | 55 | RAG crawl/analytics stubs |
| Workflow | 1 | 0 | 1 | 0 | 0 | 70 | AI/search producers deferred |
| Billing | 3 | 0 | 2 | 1 | 0 | 60 | F-033 plans page; prod Stripe env |
| Marketplace / Plugins | 2 | 0 | 2 | 0 | 0 | 52 | No FE templates UI |
| Search / Data jobs | 4 | 0 | 4 | 0 | 0 | 55 | Search-index Qdrant wiring |
| Analytics / Notify / Social / Support / Scheduler | 5 | 0 | 5 | 0 | 0 | 58 | Custom report builder stubs |
| Admin / Sub-admin / Developer | 3 | 0 | 3 | 0 | 0 | 52 | Dual `/settings` vs `/developer` |
| Audit / Email / Health / Queues | 4 | 0 | 4 | 0 | 0 | 52 | CRM audit not emitted |
| Frontend QA / Pagination / Dead routes | 3 | 0 | 1 | 2 | 0 | 22 | F-062 FE page UX; F-033/F-061 routes |
| Infra / CI / Secrets / Docs | 6 | 0 | 6 | 0 | 0 | 45 | LE cutover; secrets git history |
| Marketing | 1 | 0 | 1 | 0 | 0 | 70 | Out of CRM DoD |

---

## Wave 4 reclassifications (⚫ → 🟡, verified)

| ID | Was | Now | Evidence |
|----|-----|-----|----------|
| F-004 | ⚫ Legacy auth dup | 🟡 | Legacy root `auth.module.ts` tree **removed**; single path `modules/auth` only |
| F-029 | ⚫ Mock AI hub | 🟡 | `(app)/ai/page.tsx` → `GET /ai/usage` with loading/error/empty states (Agents 6, 11) |
| F-035 | ⚫ Templates orphan | 🟡 | `PlatformModule` imports `MarketplaceModule`; `/marketplace/templates/*` live; 3/3 integration PASS |
| F-046 | ⚫ Developer unwired | 🟡 | `DeveloperModule` in `CoreModule`; `/developer/*` APIs live; 5/5 integration PASS |

## Wave 1–3 reclassifications (⚫ → 🟡, verified)

| ID | Evidence |
|----|----------|
| F-009 | `users.controller.ts` — `@Get('groups')` L60 before `@Get(':id')` L129 |
| F-020 | `DuplicateController` in `crm.module.ts` |
| F-021 | `dashboard/page.tsx` → analytics + CRM APIs |
| F-022 | Omnichannel in `crm.module.ts`; inbox uses services |
| F-032 | Coupons in MonetizationModule; alt pay 503 |
| F-037 | `search/page.tsx` → `searchService.search()` |
| F-041 | `import/page.tsx` → `importExportService` |
| F-049 | `AuditLog` forFeature + `AuditLogListener` (auth/tenant/RBAC only) |
| F-056 | Single PG, ui, HTTPS nginx (Agent 13) |
| F-059 | git rm --cached + `.env.*.example` |

## Wave 3 additions (🔴 → 🟡)

| ID | Evidence |
|----|----------|
| F-054 | Vitest scaffold + 5 smoke tests; wired in `ci.yml` (Agent 14) |

**Not reclassified to ✅** — global DoD blockers remain (CRM audit, Playwright E2E, prod ops).

---

## Cross-cutting capability matrix

| Capability | Status | Notes |
|------------|--------|-------|
| Audit log on mutations | 🟡 Partial | Auth/tenant/RBAC only; no CRM emitters |
| Frontend unit/e2e tests | 🟡 Partial | 2 Vitest files (5 tests); Playwright absent |
| List pagination (FE UX) | 🔴 Missing | BE opt-in `page/limit`; FE not consuming |
| Production TLS + single DB + UI | 🟡 Partial | Compose fixed; LE + GHCR ops remain |
| CRM DTO validation | 🟡 Partial | Core CRM validated; AI agents/flows still `any` |
| Queue processors | 🟡 Partial | 9 processors registered; search-index DEFERRED |
| Admin authenticated API | 🟡 Partial | Zero unauth `fetch('/api/v1/...')` in admin/superadmin |
| Stripe prod checkout | 🟡 Partial | Env-driven prices; needs real IDs in deploy |
| Developer + marketplace APIs | 🟡 Partial | BE wired; FE templates/developer pages thin |

---

## Remaining ⚫ Broken (0)

None — all 12 seed broken features remediated or reclassified.

## Remaining 🔴 Missing (3)

| ID | Feature |
|----|---------|
| F-033 | `/billing/plans` page |
| F-061 | `/settings/data` page |
| F-062 | App-wide FE pagination UX |

---

## Verification evidence (Agent 15, 2026-07-22)

```
backend npm run build                              → PASS
backend npm test -- --runInBand --forceExit        → 63/63 PASS (15 suites)
backend npm run test:integration                   → 171/171 PASS (54 suites)
backend combined                                   → 234/234 PASS (69 suites)
backend test:cov unit Istanbul                     → ~11.5% stmts
frontend npm test (Vitest)                         → 5/5 PASS (2 files)
frontend npm run build                             → PASS
admin/superadmin fetch('/api/v1/...')             → 0 matches
DeveloperModule in app.module.ts                   → verified
MarketplaceModule in platform.module.ts            → verified
legacy backend/src/auth.module.ts                  → absent
TwilioController @Controller('voice/twilio')       → /api/v1/voice/twilio/*
QueueProcessorsModule                              → 9 processors registered
AI hub (app)/ai                                    → GET /api/v1/ai/usage (real KPIs)
PromptTemplateController                           → wired in AiModule (Agent 6)
POST /api/v1/ai/generate/async                     → ai-inference queue producer
Analytics integration                              → 12/12 PASS (Agent 11)
marketplace|developer integration                  → 12/12 PASS (Agent 12)
ci.yml frontend job                                → npm test + build
Playwright browser E2E                             → NOT CONFIGURED
```
