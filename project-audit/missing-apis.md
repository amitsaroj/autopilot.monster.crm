# Missing API Endpoints

Compared against `Docs/api_scope.md`. Documented path is canonical.

## Authentication (mostly implemented)
- `GET /auth/sessions` — partial via auth module
- `DELETE /auth/sessions/:id` — verify implementation

## CRM — Missing or Incomplete

```
POST   /crm/contacts/bulk-import
GET    /crm/contacts/export
POST   /crm/contacts/:id/tags
DELETE /crm/contacts/:id/tags/:tag
GET    /crm/contacts/:id/activities
GET    /crm/contacts/:id/deals
GET    /crm/contacts/:id/notes
POST   /crm/contacts/:id/notes
GET    /crm/contacts/:id/calls
GET    /crm/contacts/:id/emails
GET    /crm/contacts/:id/whatsapp
PATCH  /crm/contacts/bulk-update
DELETE /crm/contacts/bulk-delete
GET    /crm/leads/export
GET    /crm/companies/:id/contacts
GET    /crm/companies/:id/deals
GET    /crm/companies/:id/activities
PATCH  /crm/deals/:id/stage
PATCH  /crm/deals/:id/won
PATCH  /crm/deals/:id/lost
GET    /crm/deals/:id/activities
GET    /crm/deals/:id/products
POST   /crm/deals/:id/products
DELETE /crm/deals/:id/products/:productId
POST   /crm/quotes/:id/send
POST   /crm/quotes/:id/accept
POST   /crm/quotes/:id/decline
GET    /crm/quotes/:id/pdf
GET    /crm/quotes/view/:token
PATCH  /crm/tasks/:id/complete
GET    /crm/forecast
GET    /crm/forecast/by-stage
GET    /crm/forecast/by-owner
GET    /crm/forecast/historical
```

## Workflows — Missing

```
POST   /workflows/:id/activate
POST   /workflows/:id/deactivate
POST   /workflows/:id/trigger
GET    /workflows/:id/executions
GET    /workflows/executions/:execId
POST   /workflows/:id/duplicate
GET    /workflow-triggers
GET    /workflow-actions
```

## AI — Missing / Path Mismatch

```
GET/POST/PATCH/DELETE /ai/agents (currently /crm/agents)
POST   /ai/agents/:id/activate
POST   /ai/agents/:id/pause
GET    /ai/conversations (currently /ai/chats)
POST   /ai/conversations/:id/handoff
GET/POST/PATCH/DELETE /ai/knowledge-bases (currently /ai/kb)
POST   /ai/knowledge-bases/:id/sync
POST   /ai/knowledge-bases/:id/documents
DELETE /ai/knowledge-bases/:id/documents/:docId
GET/POST/PATCH/DELETE /ai/prompts
```

## Voice — Missing (majority)

```
GET    /voice/calls
POST   /voice/calls
DELETE /voice/calls/:id/hang-up
GET    /voice/calls/:id/recording
GET    /voice/calls/:id/transcript
GET    /voice/phone-numbers
POST   /voice/phone-numbers
DELETE /voice/phone-numbers/:id
GET/POST/PATCH/DELETE /voice/campaigns/*
GET    /voice/transcripts
GET/PATCH /voice/settings
```

## WhatsApp — Missing (majority)

```
GET/POST/DELETE /whatsapp/numbers
GET    /whatsapp/conversations
GET    /whatsapp/conversations/:id
POST   /whatsapp/conversations/:id/messages
POST   /whatsapp/conversations/:id/assign
POST   /whatsapp/conversations/:id/resolve
POST   /whatsapp/templates
DELETE /whatsapp/templates/:id
GET/POST/PATCH/DELETE /whatsapp/broadcasts/*
GET/PATCH /whatsapp/settings
```

## Billing — Path & Feature Gaps

Documented `/billing/*` — implemented under `/monetization/*`:
- `POST /billing/subscription/downgrade`
- `POST /billing/subscription/cancel`
- `POST /billing/subscription/reactivate`
- `GET /billing/invoices/:id/pdf`
- `GET/POST/DELETE/PATCH /billing/payment-methods/*`
- `GET /billing/usage/history`

## Analytics — Missing

```
GET /analytics/overview
GET /analytics/crm
GET /analytics/revenue
GET /analytics/pipeline
GET /analytics/team
GET /analytics/activities
GET /analytics/ai
GET /analytics/voice
GET /analytics/whatsapp
GET/POST/PATCH/DELETE /analytics/dashboards/*
GET/POST /analytics/reports/*
GET /analytics/export
```

## Settings — Missing

```
GET/PATCH /settings/profile
POST /settings/profile/avatar
PATCH /settings/password
GET/PATCH /settings/notifications
GET/PATCH /settings/workspace
GET/POST/PATCH/DELETE /settings/users/*
GET/POST/PATCH/DELETE /settings/roles/*
GET /settings/permissions
GET/POST/DELETE /settings/api-keys
GET/POST/PATCH/DELETE /settings/webhooks/*
POST /settings/webhooks/:id/test
GET/POST/DELETE /settings/integrations/*
GET/PATCH /settings/sso
```

## Search, Storage, Marketplace, Import/Export — Missing

```
GET /search (unified)
GET /search/contacts|deals|companies
GET/POST/DELETE /storage/files/*
GET /storage/usage
GET/POST/DELETE /marketplace/* (stubs only)
GET/POST/PATCH/DELETE /plugins/*
POST/GET /import/*
POST/GET /export/*
POST/GET /backup/*
GET /logs/*
```

**Estimated missing endpoints: ~180 of ~250 documented**
