# Pending Features Audit

Source of truth: `Docs/` documentation vs codebase implementation (June 2026).

## CRM Module

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| Contacts CRUD | api_scope, crm_design | Partial | Missing bulk-import/export, nested routes (activities, deals, notes, calls, emails, whatsapp on contact) |
| Leads CRUD | api_scope | Partial | Missing CSV export endpoint |
| Companies CRUD | api_scope | Partial | Missing nested contacts/deals/activities routes |
| Deals & Pipelines | api_scope | Partial | Missing stage move, won/lost PATCH, deal products, PATCH vs PUT mismatch |
| Products & Quotes | api_scope | Partial | Missing send/accept/decline/PDF/public view endpoints |
| Tasks | api_scope | Partial | Missing complete PATCH, get by id |
| Activities | api_scope | Partial | Missing get by id |
| Notes | api_scope | Partial | Missing update, get by id |
| Forecast | api_scope | **Missing** | No `/crm/forecast` endpoints; frontend uses hardcoded mock data |
| Tags | api_scope | Partial | Missing contact tag assign/remove |
| Segments | api_scope | Partial | Missing update, evaluate |
| Timeline | crm_design | Partial | No unified timeline API |
| Custom Fields | api_scope | Implemented | — |

## AI Module

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| Agents | api_scope `/ai/agents` | Partial | Agents under `/crm/agents`, not `/ai/agents`; missing activate/pause |
| Chat (SSE) | api_scope | Partial | `/ai/chat` exists but no streaming SSE |
| Conversations | api_scope | Partial | Path mismatch (`/ai/chats` vs `/ai/conversations`); missing handoff |
| Knowledge Base | api_scope | Partial | Path mismatch (`/ai/kb` vs `/ai/knowledge-bases`); missing sync, document mgmt |
| Prompts | api_scope | **Missing** | No prompt CRUD endpoints |
| RAG/Embeddings | ai_engine | Partial | RAG service exists; no embedding management API |
| Fine Tuning | ai_engine | **Missing** | Not implemented |
| Usage Tracking | api_scope | Implemented | `/ai/usage` exists |

## Voice Module

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| Call list/detail | api_scope | **Stub** | Controller returns fake data; no DB persistence on status webhook |
| Outbound calls | api_scope | Partial | `/voice/call` works via Twilio; path differs from `/voice/calls` |
| Phone numbers | api_scope | **Missing** | No provision/release endpoints |
| Campaigns | api_scope | **Missing** | No voice campaign entity or endpoints |
| Recording/Transcript | api_scope | **Stub** | Placeholder responses |
| Sentiment/Summaries | voice_engine | **Missing** | Not implemented |
| Voice Profiles | voice_engine | **Missing** | Not implemented |
| Call Routing | voice_engine | Partial | Twilio inbound only |

## WhatsApp Module

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| Conversations/Inbox | api_scope | **Missing** | No conversation endpoints |
| Templates | api_scope | **Stub** | Returns empty array; no entity |
| Broadcasts | api_scope | **Missing** | Not implemented |
| Flow Builder | whatsapp_design | **Missing** | Not implemented |
| Shared Inbox | whatsapp_design | **Missing** | Not implemented |
| Webhooks | api_scope | Partial | Meta webhook exists; message not persisted to DB consistently |
| Settings | api_scope | **Missing** | No settings endpoints |

## Workflows Module

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| CRUD | api_scope | Implemented | — |
| Activate/Deactivate | api_scope | **Missing** | No status toggle endpoints |
| Duplicate | api_scope | **Missing** | Not implemented |
| Trigger types listing | api_scope | **Missing** | `/workflow-triggers` not implemented |
| Action types listing | api_scope | **Missing** | `/workflow-actions` not implemented |
| Execution detail | api_scope | Partial | No `/workflows/executions/:execId` |

## Billing Module

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| Plans | api_scope `/billing/plans` | Partial | Under `/monetization/plans` |
| Subscription mgmt | api_scope | Partial | Upgrade/portal exist; downgrade/cancel/reactivate missing |
| Invoices | api_scope | Partial | List exists; PDF download missing |
| Payment methods | api_scope | **Missing** | No CRUD endpoints |
| Usage | api_scope | Partial | Basic usage; no history endpoint |
| Wallet/Credits | billing_design | **Missing** | Not implemented |

## Analytics Module

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| Overview | api_scope | Partial | `/analytics/dashboard` vs `/analytics/overview` |
| CRM/Revenue/Pipeline/Team | api_scope | **Missing** | Only generic metrics endpoint |
| AI/Voice/WhatsApp analytics | api_scope | **Missing** | Not implemented |
| Dashboards/Reports CRUD | api_scope | **Missing** | Reports returns `[]` |
| Export | api_scope | **Missing** | Not implemented |

## Marketplace Module

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| App directory | marketplace_design | **Stub** | Returns empty array |
| Install/Uninstall | api_scope | **Stub** | Fake success response |
| Vendor management | marketplace_design | Partial | SuperAdmin pages exist; backend thin |
| Plugins | api_scope | Partial | Basic plugin controller |

## SaaS / Developer Platform

| Feature | Doc Reference | Status | Gap |
|---------|---------------|--------|-----|
| Tenants/RBAC | tenant_design | Implemented | — |
| Feature Flags | feature_flags | Implemented | Admin module |
| Usage Limits | limits | Partial | Plan limits exist; runtime enforcement partial |
| API Keys | dev_platform | **Missing** | No entity or endpoints |
| OAuth | dev_platform | Partial | Google strategy exists; no developer OAuth app mgmt |
| Webhooks (tenant) | api_scope | **Missing** | Entity exists; no tenant-facing CRUD |
| SDK | dev_platform | **Missing** | Not implemented |

## Infrastructure

| Feature | Status | Gap |
|---------|--------|-----|
| Database migrations | **Missing** | Only `.gitkeep` in migrations folder; relies on synchronize or manual schema |
| Unit/Integration/E2E tests | **Missing** | Zero `.spec.ts` files |
| Import/Export/Backup APIs | **Missing** | Documented but not implemented at tenant level |
