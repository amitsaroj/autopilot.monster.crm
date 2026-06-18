# Database Gap Analysis — Session 7

**Date:** 2026-06-18

## Entity Inventory

| Metric | Count |
|--------|-------|
| Entity files | 76 |
| Primary (`src/database/entities/`) | 69 |
| Auth module entities | 3 |
| Legacy duplicates (`src/entities/`) | 3 |
| Migration files | 3 |

## Migrations

| Migration | Purpose | Coverage |
|-----------|---------|----------|
| `1739900000000-InitialSchema` | DDL for 5 tables | api_keys, payment_methods, voice_campaigns, whatsapp_templates, ai_prompts |
| `1739900000001-BaselineSchema` | `synchronize(false)` no-op | No DDL |
| `1739900000002-FullTextSearchIndexes` | GIN indexes | contacts, companies (partial tsvector) |

**Gap:** ~70 entities rely on `DB_SYNCHRONIZE=true` (docker-compose default) or manual schema sync. Production without synchronize is **high risk**.

## Tables Present (by domain)

### CRM (18 entities)
contact, company, deal, deal_history, deal_product, lead, pipeline, pipeline_stage, product, quote, task, activity, note, tag, segment, custom_field, campaign, email_message, flow, agent

### Auth/Tenant (5)
user (auth), session, refresh_token, tenant, invitation, team_group

### RBAC (3)
role, permission, user_role

### Billing (10)
plan, plan_feature, plan_limit, subscription, invoice, payment, payment_method, usage_record, wallet, wallet_transaction

### AI (5)
knowledge_base, conversation, message, ai_prompt, fine_tuning_job

### Voice (3)
voice_call, voice_campaign, voice_phone_number

### WhatsApp (3)
whatsapp_message, whatsapp_template, whatsapp_broadcast

### Workflow (1)
workflow_execution

### Platform (12)
platform_setting, tenant_setting, api_key, webhook, plugin, tenant_plugin, storage_file, data_job, scheduled_job, notification, announcement, social_post, dashboard_metric, analytics_dashboard, analytics_report

### Support (2)
ticket, article

### Observability (4)
audit_log, api_log, webhook_log, error_log

## Missing / Incomplete

| Item | Doc Reference | Status |
|------|---------------|--------|
| Lead score column / rules table | crm_design.md §4 | Missing — no scoring schema |
| OAuth app / SDK client table | dev_platform.md | Missing |
| WhatsApp flow definition table | whatsapp_design.md | Uses generic `flow` entity |
| Sentiment analysis results | voice_engine.md | Missing |
| PayPal/Razorpay payment records | billing_design.md | Missing |
| Plugin config schema validation | marketplace_design.md | No constraint |
| SSO provider config | tenant_design.md | Partial in tenant_setting JSON |

## Index Gaps

| Index | Status |
|-------|--------|
| GIN full-text (contacts, companies) | Migration exists (S6+) |
| tenant_id on all tenant tables | Present via BaseEntity |
| Composite (tenant_id, email) unique | Partial — depends on sync |
| Foreign key constraints | TypeORM relations defined; migration DDL absent |
| workflow_execution status index | Not in migrations |

## Relation Gaps

| Relation | Status |
|----------|--------|
| Contact ↔ Company bidirectional | Implemented (S5) |
| Deal ↔ Products (deal_product) | Implemented |
| Deal history tracking | Entity exists |
| Lead → Contact conversion | Service exists; no history table |
| Quote → Deal on accept | Partial lifecycle service |

## Recommendations

1. **P0:** Generate full baseline migration for all 76 entities (no synchronize in prod)
2. **P1:** Add lead_scores table or column per crm_design.md
3. **P1:** Add oauth_clients table for developer platform
4. **P2:** Add CHECK constraints on enum columns via migrations
5. **P2:** Add sentiment_results table for voice post-call analysis
