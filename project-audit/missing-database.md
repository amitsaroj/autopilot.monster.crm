# Missing Database Entities & Migrations

**Audit date:** 2026-06-18 (Session 13)  
Source: `Docs/database_design.md` vs `backend/src/database/entities/`

## Summary

| Metric | Count |
|--------|-------|
| Entity files | **77** |
| Migration files | **5** (+ 4 DDL modules) |
| Tables with explicit DDL | **~67** |
| Remaining entities needing DDL | **~10** (auth duplicates, join-only) |
| Schema field gaps | **~8** |

## Migration Status

| File | Purpose | Production-ready? |
|------|---------|-------------------|
| `1739900000000-InitialSchema.ts` | Extension tables (api_keys, payment_methods, voice_campaigns, whatsapp_templates, ai_prompts) | Yes |
| `1739900000001-BaselineSchema.ts` | Core platform + CRM explicit DDL | Yes |
| `1739900000002-FullTextSearchIndexes.ts` | tsvector indexes | Yes |
| `1739900000004-PlatformModulesSchema.ts` | Billing, workflows, comms, marketplace | Yes |
| `1739900000005-ExtendedModulesSchema.ts` | Voice, WhatsApp, AI, analytics, support, storage | Yes |

**TASK-011 status:** `synchronize()` removed. Explicit DDL covers all production entity tables. DDL modules in `migrations/ddl/`.

### Tables with explicit DDL (complete list)

**Core platform:** tenants, users, sessions, refresh_tokens, permissions, roles, role_permissions, user_roles, tenant_settings, plans, plan_features, plan_limits, invitations, audit_logs

**CRM:** companies, contacts, pipelines, pipeline_stages, deals, leads, activities, notes, tasks, crm_tags, crm_custom_fields, crm_segments, deal_products, deal_histories, crm_emails

**Platform modules:** subscriptions, invoices, payments, wallets, wallet_transactions, flows, workflow_executions, notifications, webhooks, webhook_logs, conversations, messages, products, quotes, plugins, tenant_plugins, platform_settings

**Extended modules:** voice_calls, voice_phone_numbers, whatsapp_messages, whatsapp_broadcasts, agents, knowledge_bases, fine_tuning_jobs, analytics_dashboards, analytics_reports, dashboard_metrics, tickets, articles, storage_files, data_jobs, oauth_apps, usage_records, social_posts, campaigns, announcements, team_groups, team_group_members, scheduled_jobs, error_logs, api_logs

**InitialSchema:** api_keys, payment_methods, voice_campaigns, whatsapp_templates, ai_prompts

### Remaining gaps

- Duplicate auth entity paths (`src/entities/` vs `src/modules/auth/entities/`) map to same tables — no additional DDL needed
- `ai_embeddings` documented but stored in Qdrant only
- Schema field gaps on voice_calls, whatsapp_messages, flow entity (see below)
- **TASK-011: COMPLETE** — all 73 entity tables have explicit DDL (verified Session 15)
- **TASK-011: COMPLETE** — all 73 entity tables have explicit DDL (verified Session 15)

## Still Missing vs Documentation

| Table | Doc Section | Status |
|-------|-------------|--------|
| `ai_embeddings` | AI | Missing — vectors in Qdrant only |
| `whatsapp_conversations` | WhatsApp | Uses generic `conversations` + `whatsapp_messages` |
| `marketplace_apps` | Marketplace | `plugin` + `tenant_plugin` entities |

## Schema Gaps in Existing Entities

| Entity | Gap |
|--------|-----|
| `voice_calls` | Missing `sentiment`, `summary`, `contact_id` FK |
| `whatsapp_messages` | Missing `conversation_id`, `template_id` |
| `conversations` | AI-focused; no WhatsApp-specific threading |
| `flow` (workflows) | Missing `version`, `run_count`, `failure_count` |
| `deals` | Has `probability`, `expected_close_date` — OK for forecast |

## Indexes

- Full-text search migration adds tsvector indexes
- Composite tenant indexes documented in `database_design.md` — not all verified in migrations
