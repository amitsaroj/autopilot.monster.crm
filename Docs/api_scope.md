# API Scope — Complete REST API Reference
Project: autopilot.monster.crm  
Base URL: `https://api.autopilotmonster.com/v1`  
Auth: Bearer JWT (access token) or API key (x-api-key header)  
All requests require: `x-tenant-id` header (except super-admin routes)

---

## Authentication Endpoints

```
POST   /auth/login              → { access_token, refresh_token, user }
POST   /auth/register           → { user, tenant }
POST   /auth/refresh            → { access_token }
POST   /auth/logout             → 200 OK
POST   /auth/forgot-password    → 200 OK (sends email)
POST   /auth/reset-password     → 200 OK
POST   /auth/verify-email       → 200 OK
POST   /auth/mfa/enable         → { qr_code, secret }
POST   /auth/mfa/verify         → 200 OK
DELETE /auth/mfa                → 200 OK
GET    /auth/sessions           → [sessions]
DELETE /auth/sessions/:id       → 200 OK
DELETE /auth/sessions           → 200 OK (revoke all)
```

---

## CRM — Contacts

```
GET    /crm/contacts                          → paginated contact list
POST   /crm/contacts                          → create contact
GET    /crm/contacts/:id                      → contact detail
PATCH  /crm/contacts/:id                      → update contact
DELETE /crm/contacts/:id                      → soft delete
POST   /crm/contacts/bulk-import              → CSV/JSON import
GET    /crm/contacts/export                   → CSV export
POST   /crm/contacts/:id/tags                 → add tags
DELETE /crm/contacts/:id/tags/:tag            → remove tag
GET    /crm/contacts/:id/activities           → contact activity feed
GET    /crm/contacts/:id/deals                → deals linked to contact
GET    /crm/contacts/:id/notes                → notes for contact
POST   /crm/contacts/:id/notes               → create note for contact
GET    /crm/contacts/:id/calls                → call history
GET    /crm/contacts/:id/emails               → email history
GET    /crm/contacts/:id/whatsapp             → WhatsApp history
POST   /crm/contacts/:id/convert              → convert lead to contact
PATCH  /crm/contacts/bulk-update              → bulk update
DELETE /crm/contacts/bulk-delete              → bulk delete
```

## CRM — Leads

```
GET    /crm/leads                             → paginated list
POST   /crm/leads                             → create lead
GET    /crm/leads/:id                         → lead detail
PATCH  /crm/leads/:id                         → update lead
DELETE /crm/leads/:id                         → soft delete
POST   /crm/leads/:id/convert                 → convert to contact + deal
GET    /crm/leads/export                      → CSV export
```

## CRM — Companies

```
GET    /crm/companies                         → paginated list
POST   /crm/companies                         → create company
GET    /crm/companies/:id                     → company detail
PATCH  /crm/companies/:id                     → update company
DELETE /crm/companies/:id                     → soft delete
GET    /crm/companies/:id/contacts            → contacts at company
GET    /crm/companies/:id/deals               → deals for company
GET    /crm/companies/:id/activities          → activity timeline
```

## CRM — Deals & Pipelines

```
GET    /crm/pipelines                         → all pipelines
POST   /crm/pipelines                         → create pipeline
GET    /crm/pipelines/:id                     → pipeline detail
PATCH  /crm/pipelines/:id                     → update pipeline
DELETE /crm/pipelines/:id                     → delete pipeline

GET    /crm/deals                             → paginated list + filters
POST   /crm/deals                             → create deal
GET    /crm/deals/:id                         → deal detail
PATCH  /crm/deals/:id                         → update deal
DELETE /crm/deals/:id                         → soft delete
PATCH  /crm/deals/:id/stage                   → move stage
PATCH  /crm/deals/:id/won                     → mark won
PATCH  /crm/deals/:id/lost                    → mark lost
GET    /crm/deals/:id/activities              → activity feed
GET    /crm/deals/:id/products                → linked products
POST   /crm/deals/:id/products                → add product to deal
DELETE /crm/deals/:id/products/:productId     → remove product
```

## CRM — Products & Quotes

```
GET    /crm/products                          → paginated list
POST   /crm/products                          → create product
GET    /crm/products/:id                      → product detail
PATCH  /crm/products/:id                      → update product
DELETE /crm/products/:id                      → soft delete

GET    /crm/quotes                            → paginated list
POST   /crm/quotes                            → create quote
GET    /crm/quotes/:id                        → quote detail
PATCH  /crm/quotes/:id                        → update quote
DELETE /crm/quotes/:id                        → soft delete
POST   /crm/quotes/:id/send                   → send quote by email
POST   /crm/quotes/:id/accept                 → accept quote
POST   /crm/quotes/:id/decline               → decline quote
GET    /crm/quotes/:id/pdf                    → download PDF
GET    /crm/quotes/view/:token                → public quote view (no auth)
```

## CRM — Tasks, Activities, Notes

```
GET    /crm/tasks                             → paginated list
POST   /crm/tasks                             → create task
GET    /crm/tasks/:id                         → task detail
PATCH  /crm/tasks/:id                         → update task
PATCH  /crm/tasks/:id/complete                → mark complete
DELETE /crm/tasks/:id                         → soft delete

GET    /crm/activities                        → paginated activity feed
POST   /crm/activities                        → log activity
GET    /crm/activities/:id                    → activity detail
DELETE /crm/activities/:id                    → delete

GET    /crm/notes                             → paginated list
POST   /crm/notes                             → create note
GET    /crm/notes/:id                         → note detail
PATCH  /crm/notes/:id                         → update note
DELETE /crm/notes/:id                         → delete note
```

## CRM — Forecast

```
GET    /crm/forecast                          → weighted pipeline forecast
GET    /crm/forecast/by-stage                 → forecast grouped by stage
GET    /crm/forecast/by-owner                 → forecast grouped by user
GET    /crm/forecast/historical               → historical forecast accuracy
```

---

## Workflow Endpoints

```
GET    /workflows                             → paginated list
POST   /workflows                             → create workflow
GET    /workflows/:id                         → workflow detail
PATCH  /workflows/:id                         → update workflow
DELETE /workflows/:id                         → delete workflow
POST   /workflows/:id/activate                → activate workflow
POST   /workflows/:id/deactivate              → deactivate workflow
POST   /workflows/:id/trigger                 → manually trigger
GET    /workflows/:id/executions              → execution history
GET    /workflows/executions/:execId          → execution detail with logs
POST   /workflows/:id/duplicate               → clone workflow
GET    /workflow-triggers                     → list available trigger types
GET    /workflow-actions                      → list available action types
```

---

## AI Endpoints

```
GET    /ai/agents                             → list agents
POST   /ai/agents                             → create agent
GET    /ai/agents/:id                         → agent detail
PATCH  /ai/agents/:id                         → update agent
DELETE /ai/agents/:id                         → delete agent
POST   /ai/agents/:id/activate
POST   /ai/agents/:id/pause

GET    /ai/conversations                      → paginated list
GET    /ai/conversations/:id                  → conversation detail with messages
POST   /ai/chat                               → send message (streaming SSE)
DELETE /ai/conversations/:id                  → clear conversation
POST   /ai/conversations/:id/handoff          → handoff to human

GET    /ai/knowledge-bases                    → list KBs
POST   /ai/knowledge-bases                    → create KB
GET    /ai/knowledge-bases/:id                → KB detail
PATCH  /ai/knowledge-bases/:id                → update KB
DELETE /ai/knowledge-bases/:id                → delete KB
POST   /ai/knowledge-bases/:id/sync          → trigger re-index
POST   /ai/knowledge-bases/:id/documents      → upload document
DELETE /ai/knowledge-bases/:id/documents/:docId → remove document

GET    /ai/prompts                            → saved prompts
POST   /ai/prompts                            → create prompt
PATCH  /ai/prompts/:id                        → update prompt
DELETE /ai/prompts/:id                        → delete prompt

GET    /ai/usage                              → AI token usage stats
```

---

## Voice Endpoints

```
GET    /voice/calls                           → paginated call list
POST   /voice/calls                           → initiate outbound call
GET    /voice/calls/:id                       → call detail
DELETE /voice/calls/:id/hang-up               → end call
GET    /voice/calls/:id/recording             → get recording presigned URL
GET    /voice/calls/:id/transcript            → get transcription
POST   /voice/webhook                         → Twilio status callback (internal)

GET    /voice/phone-numbers                   → list provisioned numbers
POST   /voice/phone-numbers                   → provision number
DELETE /voice/phone-numbers/:id               → release number

GET    /voice/campaigns                       → list campaigns
POST   /voice/campaigns                       → create campaign
GET    /voice/campaigns/:id                   → campaign detail
PATCH  /voice/campaigns/:id                   → update campaign
DELETE /voice/campaigns/:id                   → delete campaign
POST   /voice/campaigns/:id/start             → start campaign
POST   /voice/campaigns/:id/pause             → pause campaign
POST   /voice/campaigns/:id/resume            → resume campaign
GET    /voice/campaigns/:id/stats             → campaign stats

GET    /voice/transcripts                     → paginated transcripts
GET    /voice/transcripts/:id                 → transcript detail

GET    /voice/settings                        → voice settings
PATCH  /voice/settings                        → update voice settings
```

---

## WhatsApp Endpoints

```
GET    /whatsapp/numbers                      → active WA numbers
POST   /whatsapp/numbers                      → register number (Cloud API)
DELETE /whatsapp/numbers/:id                  → deregister

GET    /whatsapp/conversations                → paginated inbox
GET    /whatsapp/conversations/:id            → conversation with messages
POST   /whatsapp/conversations/:id/messages   → send message
POST   /whatsapp/conversations/:id/assign     → assign to agent
POST   /whatsapp/conversations/:id/resolve    → mark resolved

GET    /whatsapp/templates                    → list templates
POST   /whatsapp/templates                    → submit template for approval
GET    /whatsapp/templates/:id                → template detail
DELETE /whatsapp/templates/:id                → delete template

GET    /whatsapp/broadcasts                   → broadcast list
POST   /whatsapp/broadcasts                   → create broadcast
GET    /whatsapp/broadcasts/:id               → broadcast detail
POST   /whatsapp/broadcasts/:id/send          → send now
PATCH  /whatsapp/broadcasts/:id/schedule      → schedule broadcast
DELETE /whatsapp/broadcasts/:id               → delete

POST   /whatsapp/webhook                      → Meta webhook handler (internal)

GET    /whatsapp/settings                     → WA settings
PATCH  /whatsapp/settings                     → update settings
```

---

## Billing Endpoints

```
GET    /billing/subscription                  → current subscription
POST   /billing/subscription/upgrade          → upgrade plan
POST   /billing/subscription/downgrade        → downgrade plan
POST   /billing/subscription/cancel           → cancel
POST   /billing/subscription/reactivate       → reactivate cancelled

GET    /billing/plans                         → all public plans
GET    /billing/plans/:id                     → plan detail with features + limits

GET    /billing/invoices                      → paginated invoice list
GET    /billing/invoices/:id                  → invoice detail
GET    /billing/invoices/:id/pdf              → download invoice PDF

GET    /billing/payment-methods               → list payment methods
POST   /billing/payment-methods               → add card (stripe setup intent)
DELETE /billing/payment-methods/:id           → remove card
PATCH  /billing/payment-methods/:id/default   → set default

GET    /billing/usage                         → current period usage
GET    /billing/usage/history                 → usage history

POST   /billing/webhook                       → Stripe webhook handler (internal)
```

---

## Analytics Endpoints

```
GET    /analytics/overview                    → dashboard KPI summary
GET    /analytics/crm                         → CRM KPIs (contacts, deals, conversion)
GET    /analytics/revenue                     → MRR, ARR, churn, LTV
GET    /analytics/pipeline                    → pipeline funnel, by stage, by owner
GET    /analytics/team                        → rep performance + quota attainment
GET    /analytics/activities                  → activity analytics
GET    /analytics/ai                          → AI agent performance
GET    /analytics/voice                       → call analytics
GET    /analytics/whatsapp                    → WhatsApp message analytics

GET    /analytics/dashboards                  → saved dashboards
POST   /analytics/dashboards                  → create dashboard
GET    /analytics/dashboards/:id              → dashboard detail
PATCH  /analytics/dashboards/:id              → update dashboard
DELETE /analytics/dashboards/:id              → delete

GET    /analytics/reports                     → saved reports
POST   /analytics/reports                     → create report
POST   /analytics/reports/:id/run             → run report
GET    /analytics/reports/:id/results         → report results
GET    /analytics/export                      → export analytics data
```

---

## Settings Endpoints

```
GET    /settings/profile                      → get own profile
PATCH  /settings/profile                      → update profile
POST   /settings/profile/avatar               → upload avatar

PATCH  /settings/password                     → change password

GET    /settings/notifications                → notification preferences
PATCH  /settings/notifications                → update preferences

GET    /settings/workspace                    → workspace settings
PATCH  /settings/workspace                    → update workspace

GET    /settings/users                        → team members list
POST   /settings/users/invite                 → invite member
PATCH  /settings/users/:id                    → update member
DELETE /settings/users/:id                    → remove member

GET    /settings/roles                        → roles list
POST   /settings/roles                        → create custom role
PATCH  /settings/roles/:id                    → update role
DELETE /settings/roles/:id                    → delete role
GET    /settings/permissions                  → all permissions list

GET    /settings/api-keys                     → list API keys
POST   /settings/api-keys                     → create API key
DELETE /settings/api-keys/:id                 → revoke API key

GET    /settings/webhooks                     → list webhooks
POST   /settings/webhooks                     → create webhook
PATCH  /settings/webhooks/:id                 → update webhook
DELETE /settings/webhooks/:id                 → delete webhook
POST   /settings/webhooks/:id/test            → test webhook delivery

GET    /settings/integrations                 → integration status
POST   /settings/integrations/:name/connect   → OAuth connect
DELETE /settings/integrations/:name           → disconnect

GET    /settings/sso                          → SSO config
PATCH  /settings/sso                          → update SSO config
```

---

## Admin Endpoints (Super Admin Only)

```
GET    /admin/tenants                         → all tenants
POST   /admin/tenants                         → create tenant
GET    /admin/tenants/:id                     → tenant detail
PATCH  /admin/tenants/:id                     → update tenant (plan, settings)
POST   /admin/tenants/:id/suspend             → suspend tenant
POST   /admin/tenants/:id/activate            → reactivate tenant
DELETE /admin/tenants/:id                     → delete tenant
GET    /admin/tenants/:id/users               → tenant users
GET    /admin/tenants/:id/billing             → tenant billing overview

GET    /admin/users                           → all users across all tenants
POST   /admin/users                           → create user
PATCH  /admin/users/:id                       → update user
DELETE /admin/users/:id                       → delete user
POST   /admin/users/:id/impersonate           → impersonate user

GET    /admin/plans                           → all plans
POST   /admin/plans                           → create plan
PATCH  /admin/plans/:id                       → update plan
DELETE /admin/plans/:id                       → archive plan

GET    /admin/feature-flags                   → all feature flags
POST   /admin/feature-flags                   → create flag
PATCH  /admin/feature-flags/:id               → update flag (global)
DELETE /admin/feature-flags/:id               → delete flag

GET    /admin/tenant-feature-overrides        → per-tenant overrides
POST   /admin/tenant-feature-overrides        → set override for tenant

GET    /admin/limits                          → plan limits management
PATCH  /admin/limits/:planId/:metric          → update limit

GET    /admin/metrics                         → system metrics
GET    /admin/health                          → all service health
GET    /admin/audit-logs                      → cross-tenant audit logs
GET    /admin/subscriptions                   → all subscriptions
```

---

## Logs Endpoints

```
GET    /logs/audit                            → audit log (tenant-scoped)
GET    /logs/api                              → API request logs
GET    /logs/webhooks                         → webhook delivery logs
GET    /logs/workers                          → background job logs
GET    /logs/ai                               → AI conversation logs
GET    /logs/voice                            → call event logs
```

---

## Search Endpoints

```
GET    /search?q=query&types=contacts,deals,companies
       → unified search across all entity types

GET    /search/contacts?q=query
GET    /search/deals?q=query
GET    /search/companies?q=query
```

---

## Storage Endpoints

```
GET    /storage/files                         → file list for tenant
POST   /storage/files/upload                  → get presigned upload URL
GET    /storage/files/:id                     → file metadata
GET    /storage/files/:id/download            → presigned download URL
DELETE /storage/files/:id                     → delete file

GET    /storage/usage                         → storage usage stats
```

---

## Marketplace & Plugin Endpoints

```
GET    /marketplace                           → public app directory
GET    /marketplace/:id                       → app detail
POST   /marketplace/:id/install               → install app
DELETE /marketplace/:id/uninstall             → uninstall app
GET    /marketplace/installed                 → installed apps

GET    /plugins                               → registered plugins
POST   /plugins                               → register plugin
GET    /plugins/:id                           → plugin detail
PATCH  /plugins/:id                           → update plugin
DELETE /plugins/:id                           → delete plugin
POST   /plugins/:id/enable                    → enable plugin
POST   /plugins/:id/disable                   → disable plugin
```

---

## Import / Export / Backup

```
POST   /import                                → start import job
GET    /import/:jobId                         → import job status
GET    /import/history                        → import history

POST   /export                                → start export job
GET    /export/:jobId                         → export status + download URL
GET    /export/history                        → export history

POST   /backup                                → trigger manual backup
GET    /backup                                → backup history
GET    /backup/:id/download                   → download backup archive
POST   /backup/:id/restore                    → restore from backup
```
