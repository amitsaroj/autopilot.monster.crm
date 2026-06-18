# Missing Database Entities & Migrations

Source: `Docs/database_design.md` vs `backend/src/database/entities/`

## Migration Status

- **Critical gap:** `backend/src/database/migrations/` contains only `.gitkeep`
- No versioned schema migrations despite documentation requiring `typeorm migration:run`
- Production relies on TypeORM `autoLoadEntities` + possible `synchronize` in dev

## Entities Present (61 files)

Core tenant/auth: tenant, user (auth module), role, permission, user-role, session, invitation
CRM: contact, company, lead, deal, deal-history, pipeline, pipeline-stage, activity, task, note, product, quote, tag, segment, custom-field, campaign, email-message, article
Billing: plan, plan-feature, plan-limit, subscription, invoice, payment, usage-record
AI: agent, knowledge-base, conversation
Voice: voice-call (partial)
WhatsApp: whatsapp-message (partial)
Workflow: flow, workflow-execution
Other: webhook, webhook-log, audit-log, api-log, error-log, plugin, tenant-plugin, notification, ticket, social-post, team-group, scheduled-job, dashboard-metric, platform-setting, tenant-setting

## Entities Missing vs Documentation

| Table | Doc Section | Status |
|-------|-------------|--------|
| api_keys | Tenant & Auth | **Missing entity** |
| sessions (full) | Tenant & Auth | Partial (session entity in auth) |
| voice_campaigns | Voice | **Missing** |
| whatsapp_templates | WhatsApp | **Missing** |
| whatsapp_conversations | WhatsApp | **Missing** (conversation entity is AI-focused) |
| whatsapp_broadcasts | WhatsApp | **Missing** |
| whatsapp_numbers | WhatsApp | **Missing** |
| ai_prompts | AI | **Missing** |
| ai_embeddings | AI | **Missing** (vectors in Qdrant only) |
| fine_tuning_jobs | AI | **Missing** |
| wallet | Billing | **Missing** |
| credits | Billing | **Missing** |
| payment_methods | Billing | **Missing** |
| analytics_dashboards | Analytics | **Missing** |
| analytics_reports | Analytics | **Missing** |
| marketplace_apps | Marketplace | **Missing** |
| oauth_applications | Developer Platform | **Missing** |
| import_jobs | Import/Export | **Missing** |
| export_jobs | Import/Export | **Missing** |
| backup_snapshots | Backup | **Missing** |

## Schema Gaps in Existing Entities

| Entity | Gap |
|--------|-----|
| voice_calls | Missing contact_id FK, sentiment, summary fields |
| whatsapp_messages | Missing contact_id, conversation_id, template fields per doc |
| deals | Has probability/expected_close_date — good for forecast |
| flow (workflows) | Missing version, runs, failures counters |

## Indexes

Documented composite indexes in `database_design.md` — not verified in migrations (no migration files).

**Missing entities: ~18**
**Migration files: 0**
