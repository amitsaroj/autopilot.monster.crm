# PARTIAL FEATURE REPORT

**Audit date:** 2026-07-22  
**Agent:** 15 — Production Readiness Auditor (post Wave 4)  
**Classification:** 🟡 Partial only (59 features)

DoD not met: at least one of Backend, DB, API, FE wiring, validation, permissions, audit, tests, or production ops is incomplete.

---

## Summary

| Count | Notes |
|------:|-------|
| **59** | 95% of inventory; **0** promoted to ✅ |

---

## Critical-path partials (production blockers)

| ID | Feature | % | Top gap | Wave fix |
|----|---------|--:|---------|----------|
| F-001 | Auth core | 74 | CRM audit; RS256 keys ops | Agent 4 |
| F-005 | Multi-tenant | 72 | Audit partial | — |
| F-007 | RBAC | 68 | FE hub fake stats (`admin/rbac/page.tsx`) | Agent 4 partial |
| F-010–F-019 | CRM entities | 64–76 | FE pagination; duplicate merge UI | Agent 5 |
| F-022 | Omnichannel inbox | 48 | EMAIL/VOICE send stubs | Agents 2, 8 |
| F-023–F-024 | WhatsApp | 67 | Live Meta creds; per-tenant WABA | Agent 8 |
| F-025 | Voice/Twilio | 72 | Campaign dialer; STT/TTS/sentiment stubs | Agent 7 |
| F-026–F-029 | AI platform | 52–58 | RAG crawl/analytics stubs; no FE tests | Agents 6, 11 |
| F-031 | Stripe billing | 70 | Real prod price IDs; metered sync | Agent 10 |
| F-035 | Marketplace templates | 52 | BE live; no FE templates UI | Agent 12 |
| F-046 | Developer APIs | 55 | Dual `/settings` vs `/developer` surface | Agent 12 |
| F-047 | Platform admin | 55 | Thin admin tests; uneven page depth | Agents 2, 4 |
| F-049 | Audit logging | 48 | CRM mutations not audited | Agent 4 |
| F-052 | Queue workers | 58 | Search-index DEFERRED; billing producers open | Agent 9 |
| F-054 | FE automated tests | 15 | Vitest scaffold only; Playwright absent | Agent 14 |
| F-056 | Prod compose/TLS | 45 | LE cert cutover; GHCR image supply | Agent 13 |
| F-059 | Secrets hygiene | 38 | Git history still contains old env files | Agent 4 |

---

## Wave 4 improvements (⚫ → 🟡)

| ID | Feature | Evidence |
|----|---------|----------|
| F-004 | Legacy auth removed | Single `modules/auth` path; no root auth tree |
| F-029 | AI hub KPIs | `GET /ai/usage` with loading/error states |
| F-035 | Marketplace templates | `MarketplaceModule` mounted; template CRUD + install API |
| F-046 | Developer module | `DeveloperModule` in CoreModule; webhooks/OAuth/logs APIs |

---

## Waves 1–3 improvements (⚫ → 🟡)

| ID | Feature | Evidence |
|----|---------|----------|
| F-009 | User groups API | Route order fixed |
| F-020 | Duplicate merge | `DuplicateController` in `CrmModule` |
| F-021 | Main dashboard | Analytics + CRM APIs wired |
| F-022 | Omnichannel inbox | OmnichannelController + WA merge |
| F-032 | Alt payments | Coupons CRUD; PayPal/Razorpay 503 |
| F-037 | Tenant search UI | Live `GET /search` |
| F-041 | Import/Export hubs | History + job start |
| F-049 | Audit logging | Listener for auth/tenant/RBAC |
| F-056 | Prod compose/TLS | Single Postgres, UI, HTTPS nginx |
| F-059 | Secrets hygiene | Untrack staged + examples |
| F-028 | Prompt templates | `PromptTemplateController` wired (Agent 6) |
| F-039 | Analytics | Advanced controller + queue + PDF (Agent 11) |
| F-054 | FE tests | Vitest 5/5 (Agent 14) |

---

## By domain (all 59 partial features)

### Auth & Users (6)
F-001, F-002, F-003, F-004, F-008, F-009

### Tenant & RBAC (3)
F-005, F-006, F-007

### CRM (12)
F-010, F-011, F-012, F-013, F-014, F-015, F-016, F-017, F-018, F-019, F-020

### Comms (4)
F-022, F-023, F-024, F-025

### AI (4)
F-026, F-027, F-028, F-029

### Workflow & Billing (3)
F-030, F-031, F-032

### Platform (10)
F-034, F-035, F-036, F-038, F-039, F-040, F-042, F-045, F-046, F-047, F-048, F-049

### Support / Social / Health (4)
F-043, F-044, F-051, F-050

### Infra / CI / Docs (6)
F-052, F-053, F-055, F-056, F-057, F-058, F-059, F-060

### Frontend QA (1)
F-054

---

## Why none reach ✅

Global DoD blockers affecting every feature:

1. **BL-C10** — Playwright + admin smoke tests absent (Vitest scaffold only)
2. **BL-C01** — CRM audit emitters not implemented
3. **BL-C03** — Secrets remain in git history
4. **Production ops** — LE certs, Stripe price IDs, Meta WABA creds unverified in prod
5. **FE scale UX** — F-062 pagination missing

A feature may be 70%+ implemented but fails DoD on audit + tests + prod readiness.
