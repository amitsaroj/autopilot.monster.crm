# Database Gap Analysis — Session 12

**Date:** 2026-06-19

## Entity Inventory

| Metric | Count |
|--------|-------|
| Entity files | 71 |
| Migration files | 8 |
| DDL modules | 4 |

## Migrations

| Migration | Purpose | Coverage |
|-----------|---------|----------|
| InitialSchema | 5 tables DDL | Partial |
| BaselineSchema | synchronize no-op | **No DDL** |
| FullTextSearchIndexes | GIN indexes | contacts, companies |
| PlatformModulesSchema | Modular DDL | Partial |

**Gap:** ~63 entities rely on synchronize or manual sync. Production without explicit migration is **high risk**.

## Missing / Incomplete

| Item | Status |
|------|--------|
| Lead score rules table | Missing |
| OAuth/SDK client table | Missing |
| WhatsApp flow dedicated table | Uses generic flow |
| Voice sentiment results | Missing |
| PayPal/Razorpay records | Missing |

## Index Gaps

| Index | Status |
|-------|--------|
| GIN full-text | Migration exists |
| tenant_id on tenant tables | BaseEntity |
| FK in migration DDL | Absent |
| workflow_execution indexes | Not migrated |

## Recommendations

1. TASK-011 — full baseline DDL
2. Disable DB_SYNCHRONIZE in prod
3. Add lead scoring schema before rule engine
4. CI: migration:run on fresh DB
