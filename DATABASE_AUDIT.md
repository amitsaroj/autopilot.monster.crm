# DATABASE AUDIT

**Audit date:** 2026-07-22  
**Agent:** 15 — Production Readiness Auditor (post Wave 4)  
**Engine:** PostgreSQL (TypeORM) · Redis · MinIO · Qdrant

---

## Executive summary

| Area | Status |
|------|--------|
| Schema / entities | 🟡 Partial |
| Migrations | 🟡 Partial |
| Multi-tenant isolation | 🟡 Partial (tests exist) |
| Prod DB config | 🟡 Partial (single PG fixed) |
| Audit log persistence | 🟡 Partial |
| Search index (Qdrant) | 🟡 Partial |
| Developer tables | 🟡 Partial (module now wired) |

**Production-ready:** No — audit table underutilized + pagination not enforced at DB layer + Qdrant wiring open.

---

## Production compose (Agent 13)

| Before | After |
|--------|-------|
| Dual Postgres (`postgres` + `db`) racing on volume | Single `postgres` service |
| `DATABASE_URL` host=`db` orphan | In-network `postgres:5432` |
| No UI DB dependency | API health-gated startup |

**Verdict:** 🟡 Partial — coherent local/prod skeleton; LE + GHCR ops remain.

---

## Entity / migration coverage

| Domain | Entities | Migrations | Notes |
|--------|----------|------------|-------|
| Auth / Users | ✅ | ✅ | MFA, sessions |
| Tenant | ✅ | ✅ | Isolation integration tests |
| RBAC | ✅ | ✅ | `1740000000002/3` |
| CRM (contacts–quotes) | ✅ | ✅ | Soft-delete on contact |
| Omnichannel | ✅ | 🟡 | Conversation/Message registered (Agent 2) |
| WhatsApp | ✅ | ✅ | |
| Voice | ✅ | ✅ | VoiceCall persistence via VoiceModule |
| Billing | ✅ | ✅ | Plans, subscriptions, coupons |
| Audit | ✅ | ✅ | Table exists; CRM writes absent |
| Workflow | ✅ | ✅ | WorkflowExecution entity |
| Developer | ✅ | ✅ | Module wired Wave 4 — tables now reachable |
| Marketplace templates | ✅ | ✅ | Template entity via MarketplaceModule |

**124 controllers** · TypeORM entities under `backend/src/database/entities/`

---

## Critical DB findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| DB-01 | `DB_SYNCHRONIZE=true` was in tracked prod env | Critical | 🟡 Fixed in example; history remains |
| DB-02 | Audit log table underutilized | High | 🟡 Open — CRM no emitters |
| DB-03 | No DB-level pagination enforcement | Medium | 🟡 Opt-in at API layer only |
| DB-04 | Qdrant index not fed by search-index queue | Medium | 🟡 DEFERRED processor |
| DB-05 | Developer tables unused until Wave 4 | Medium | ✅ Remediated — module mounted |

---

## Pagination (F-062 / BL-H01)

| Entity | BE opt-in pagination | FE consuming |
|--------|---------------------|--------------|
| Contacts | ✅ `CrmListQueryDto` | ❌ Full array load |
| Companies | ✅ | ❌ |
| Leads | ✅ | ❌ |
| Deals | ✅ | ❌ |
| Tasks | ✅ | ❌ |
| Products | ✅ | ❌ |
| Quotes | ✅ | ❌ |

**Recommendation:** Add shared FE pagination; consider default paginated API contract.

---

## Multi-tenant isolation

| Test | Result |
|------|--------|
| `tenant-isolation.integration.spec.ts` | ✅ PASS |
| `cross-tenant-http.integration.spec.ts` | ✅ PASS |

**Verdict:** 🟡 Partial — tested paths green; not all 124 controllers have dedicated isolation tests.

---

## Redis / queue persistence

| Queue | Processor | DB touch |
|-------|-----------|----------|
| workflow | ✅ Active | WorkflowExecution updates |
| whatsapp | ✅ Active | Message/conversation |
| import/export | ✅ Active | Job status entities |
| analytics | ✅ Active | `dashboard_metrics` via `captureMetric` |
| search-index | 🟡 DEFERRED | No Qdrant upsert yet |
| ai-inference | ✅ Active | Calls RAG (Agent 6) |

---

## Wave 4 DB impact

- **DeveloperModule:** Webhook, OAuth app, API log entities now exercised by live APIs  
- **MarketplaceModule:** Template CRUD/install increments usage counters  
- **Legacy auth entities:** Removed with F-004 — no orphan auth tables at root  

**Database sign-off:** Not ready for production.
