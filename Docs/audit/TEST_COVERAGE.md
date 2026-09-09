# TEST COVERAGE — Autopilot Monster CRM

**Date:** 2026-07-22  
**Agent:** 14 findings + Agent 15 verification (post Wave 4)  
**Repo:** `/data/Antier-project/Demo/autopilots.monster.crm`

---

## Executive summary

| Layer | Suites | Tests | Pass | Fail | Blocker |
|-------|-------:|------:|-----:|-----:|---------|
| Backend unit (`npm test`) | 15 | 63 | 63 | 0 | — |
| Backend integration (`npm run test:integration`) | 54 | 171 | 171 | 0 | Requires Postgres + Redis + MinIO |
| Frontend unit (Vitest) | 2 | 5 | 5 | 0 | Scaffold only |
| Playwright / browser E2E | 0 | 0 | — | — | **Not scaffolded** |

**Combined backend:** **69 suites · 234 tests · 234 PASS · 0 FAIL**

**Combined frontend (Vitest):** **2 files · 5 tests · 5 PASS · 0 FAIL**

**Unit statement coverage (jest `--coverage`, src only):** **11.5%** stmts · **8.3%** branches · **4.3%** funcs · **11.1%** lines

Integration tests exercise HTTP paths end-to-end against a bootstrapped Nest app; they do **not** contribute to Istanbul line coverage of `src/`.

---

## Test run evidence (Agent 15, 2026-07-22)

### Backend unit — PASS

```
Test Suites: 15 passed, 15 total
Tests:       63 passed, 63 total
Time:        ~9s (--runInBand --forceExit)
```

### Backend integration — PASS

```
Test Suites: 54 passed, 54 total
Tests:       171 passed, 171 total
Time:        ~43s (--runInBand --forceExit)
```

**Δ vs Agent 14:** +2 suites · +10 tests (marketplace-templates + developer-http integration)

**Notable suites (post Waves 1–4):**

- CRM+voice HTTP: 35 tests — bootstrap + DI verified (Agent 7)
- Workflow: 12 unit + HTTP suites
- Billing: subscription, webhook, wallet
- Security: secured-guards, rbac, cross-tenant, tenant-isolation
- AI: ai-platform (11/11), ai-agents-read
- Analytics: 12/12 (Agent 11)
- Marketplace + Developer: 12/12 (Agent 12)

### Frontend Vitest — PASS

```
Test Files  2 passed (2)
Tests       5 passed (5)
Time:       ~1.5s
```

**Spec files:**

| Module | File | Tests |
|--------|------|------:|
| API client | `src/lib/api/client.test.ts` | 2 |
| Utils | `src/lib/utils.test.ts` | 3 |

---

## Playwright / browser E2E — NOT CONFIGURED

No `playwright.config.ts`, no root `e2e/` project. Backend `test/e2e/` = Jest integration helpers only.

---

## CI alignment (`.github/workflows/ci.yml`)

| Job | What runs | Status |
|-----|-----------|--------|
| `backend` | `npm test` + `npm run test:integration` | ✅ Runs |
| `frontend` | `npm test` + `npm run build` | ✅ Wired (Agent 14 follow-up) |
| `deploy.yml` | Terraform + Docker push on `prod` | 🟡 No test gate before deploy |

**Gaps:** No coverage artifact; backend unit job lacks `--runInBand --forceExit`; no Playwright job.

---

## Coverage gaps (honest assessment)

### Backend — strong integration, weak unit breadth

| Area | Integration | Unit | Gap |
|------|:-----------:|:----:|-----|
| Auth / JWT / refresh | ✅ | partial | RS256 prod path untested |
| CRM CRUD / deals / leads | ✅ | partial | Duplicate merge HTTP |
| Voice / Twilio webhooks | ✅ | ✅ (5) | Campaign dialer queue |
| Workflow / Bull processors | ✅ | ✅ (12) | Search-index DEFERRED |
| Billing / Stripe | ✅ | ✅ (15) | Real price IDs / checkout UI |
| RBAC / guards | ✅ | partial | FE enforcement |
| Audit log emitters | partial | none | CRM mutation audit not covered |
| Developer / Marketplace | ✅ NEW | none | OAuth E2E untested |
| AI / RAG / search-index | ✅ read HTTP | none | Qdrant wiring, inference quality |
| Queue processors | none isolated | none | 9 processors; limited unit tests |

### Frontend — minimal scaffold (5 tests)

334 pages · 2 spec files · 5 smoke tests. High-risk untested surfaces:

- Tenant dashboard / inbox / search (wired but no regression tests)
- Admin hubs migrated to axios (BL-C07)
- RBAC-gated routes and role-based nav
- Billing checkout / Stripe Elements
- AI hub live usage (F-029 fixed, untested)
- Workflow builder (React Flow)

### Cross-cutting

- No contract tests between FE services and OpenAPI
- No visual/regression testing
- No load/smoke against prod compose
- No coverage thresholds

---

## BL-C10 status

| Item | Status |
|------|--------|
| Vitest + jsdom in `frontend/` | ✅ Done |
| 2 smoke test files (5 tests) | ✅ Done |
| Wire `npm test` into `ci.yml` | ✅ Done |
| `@testing-library/react` + admin page smoke | ❌ Open |
| Playwright config + login→dashboard baseline | ❌ Open |
| Processor unit tests for queue workers | ❌ Open |
| CRM audit emitter integration tests | ❌ Open |

**Verdict:** 🟡 Partial — F-054 reclassified from 🔴 Missing to 🟡 Partial.

---

## Recommendations

### P0
1. Block deploy on `ci.yml` green for PRs to `prod`
2. Add `--runInBand --forceExit` to backend CI unit job

### P1 (BL-C10 remainder)
1. `@testing-library/react` + admin dashboard smoke
2. Playwright against `docker-compose.yml`

### P2
1. Integration tests for developer OAuth token flow
2. CRM audit emitter tests after BL-C01
3. Publish `test:cov` artifact; track trend

**Commit/push:** none (per instructions)
