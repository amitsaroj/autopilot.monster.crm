# Database Audit Report — Session 12

**Date:** 2026-06-19

## Inventory

| Metric | Count |
|--------|-------|
| Entity files | 71 |
| Migration files | 8 |
| DDL modules | 4 (`core-platform`, `core-crm`, `platform-modules`, `migration-utils`) |
| Legacy duplicates (`src/entities/`) | 3 |

## Migration Status

| Migration | Purpose | Production Safe |
|-----------|---------|-----------------|
| `1739900000000-InitialSchema` | 5 tables DDL | ✅ |
| `1739900000001-BaselineSchema` | synchronize no-op | ❌ |
| `1739900000002-FullTextSearchIndexes` | GIN indexes | ✅ |
| `1739900000004-PlatformModulesSchema` | Platform DDL module | ⚠️ Partial |
| Additional DDL ts files | Modular schema | ⚠️ Incomplete coverage |

**Verdict:** ~63 entities still depend on TypeORM synchronize or manual sync. **NOT production-certified.**

## Entity Coverage by Domain

| Domain | Entities | Migrated DDL | Sync-Dependent |
|--------|----------|--------------|----------------|
| CRM | 18 | Partial | Yes |
| Auth/Tenant | 6 | Partial | Yes |
| RBAC | 3 | Partial | Yes |
| Billing | 10 | Partial | Yes |
| AI | 5 | Partial | Yes |
| Voice | 3 | Partial | Yes |
| WhatsApp | 3 | Partial | Yes |
| Workflow | 1+ | Partial | Yes |
| Platform | 15+ | Partial | Yes |
| Observability | 4 | Partial | Yes |

## Missing Schema (per Docs)

| Item | Doc | Status |
|------|-----|--------|
| `lead_score_rules` table | crm_design.md §4 | ❌ Missing |
| OAuth/SDK client table | dev_platform.md | ❌ Missing |
| WhatsApp flow entity (dedicated) | whatsapp_design.md | ⚠️ Uses generic `flow` |
| Voice sentiment results | voice_engine.md | ❌ Missing |
| PayPal/Razorpay payment records | billing_design.md | ❌ Missing |
| SSO provider config columns | tenant_design.md | ⚠️ JSON in tenant_setting |

## Index & Constraint Gaps

| Index/Constraint | Status |
|------------------|--------|
| GIN tsvector (contacts, companies) | ✅ Migration exists |
| tenant_id on tenant tables | ✅ Via BaseEntity |
| Composite unique (tenant_id, email) | ⚠️ Sync-dependent |
| FK constraints in migrations | ❌ Relations in entities only |
| workflow_execution (status, tenant_id) | ❌ Not in migrations |
| audit_log created_at index | ❌ Not in migrations |

## Relations Verified

- CRM: contact ↔ company, deal ↔ pipeline_stage, quote ↔ products — entity relations defined
- Billing: subscription ↔ plan, invoice ↔ payment — defined
- Multi-tenant: all major entities extend BaseEntity with tenantId

## Recommendations

1. **TASK-011:** Generate single baseline migration from entity audit (71 entities)
2. Add lead scoring schema before rule engine UI
3. Add migration for workflow_execution indexes
4. Disable `DB_SYNCHRONIZE` in all prod compose/env templates
5. Add CI step: `migration:run` on fresh DB + smoke query per domain
