# Database Audit Report

Mirror of `project-audit/database-gap-analysis.md`.

## Key Findings

- **76 entities**, **3 migrations** (only 5 tables + GIN indexes have explicit DDL)
- Production schema depends on `DB_SYNCHRONIZE=true` in docker-compose — **not safe for prod**
- Lead scoring schema missing
- OAuth/SDK client tables missing
- Sentiment results table missing

## Recommendations

1. P0: Full baseline migration for all entities
2. P1: Lead scores schema per crm_design.md
3. P1: oauth_clients for developer platform

See `project-audit/database-gap-analysis.md` for full detail.
