# Missing Features — Super Admin Audit Swarm

**Date:** 2026-06-19  
**Source:** Consolidated from 15 domain audit reports

Features, APIs, and pages that are **not implemented** or exist only as design docs/stubs.

---

## P0 — Blocks Production Operations

| Feature | Domain | Backend | Frontend | Notes |
|---------|--------|---------|----------|-------|
| Super Admin Feature Flags UI | Super Admin | ✅ API exists | ❌ No page | `/admin/feature-flags/*` has no UI |
| Super Admin Pricing Settings UI | Super Admin | ✅ API exists | ❌ No page | `admin-pricing.service.ts` unused |
| Super Admin Usage Dashboard | Super Admin | ✅ API exists | ❌ No page | `/admin/usage`, `/admin/usage/summary` |
| Tenant Create/Edit/Detail Pages | Super Admin | ✅ API exists | ❌ No forms | Provision button inert; no `/tenants/[id]` |
| Plan Create/Edit UI | Super Admin | ✅ API exists | ❌ Read-only | Edit/delete buttons non-functional |
| Production DDL Migrations | Infra | ⚠️ Partial | N/A | TASK-011 — 76 entities; BaselineSchema no-op |
| Automated Postgres Backups | Infra | ❌ Stub | ❌ Stub | `AdminBackupsService` returns fake data |
| Usage Metering Invocation | Billing | ⚠️ Defined | N/A | `trackUsage()` never called from CRM/AI/Voice |
| Admin HTTP Integration Tests | Super Admin | N/A | N/A | Zero admin E2E tests |
| Real-Guard Integration Tests | Security | N/A | N/A | TASK-020 — guards overridden in test helper |

---

## P1 — Important Product Gaps

### Authentication

| Feature | Status |
|---------|--------|
| SAML/OIDC SSO backend | UI-only at `/settings/workspace/sso` |
| SSO ACS/callback routes | Not implemented |
| Auth E2E in CI | Integration tests excluded from Jest |

### Billing & Monetization

| Feature | Status |
|---------|--------|
| PayPal integration | No module, entities, webhooks, or UI |
| Razorpay integration | Not implemented |
| Coupon / promotion codes | No entity or Stripe integration |
| Stripe metered billing | No usage records to Stripe |
| Admin manual refund API | Webhook-only refund handling |
| Billing upgrade page API wiring | Static mock plans at `/billing/upgrade` |
| Billing usage page API wiring | Static mock data |
| Trial expiry scheduler | Documented but not verified |
| Billing cycle change endpoint | Missing |

### Super Admin

| Feature | Status |
|---------|--------|
| User create/edit/invite flows | Buttons non-functional |
| Platform role assignment UI | No integration with `admin/roles` |
| Tenant override editor UI | Backend only |
| Plan override UI | `/admin/plan-override` — no frontend |
| User override UI | `/admin/user-override` — no frontend |
| Rate limits admin page | `/admin/rate-limit` — no frontend |
| IP whitelist admin page | `/admin/ip-whitelist` — no frontend |
| Global limits page | `/superadmin/limits` — 404 |
| Logo/favicon upload | Placeholder UI only |
| Maintenance mode toggle | Not exposed in settings UI |
| Audit log CSV export | Button non-functional |
| Revenue/MRR trend API | No time-series endpoint |

### AI

| Feature | Status |
|---------|--------|
| OpenAI function calling / CRM tools | Designed in Docs/ai_engine.md |
| Agent schema extensions | `knowledgeBaseIds`, `memoryEnabled`, `tools`, `channels` |
| Anthropic/Claude support | OpenAI only |
| URL/Notion/Google Doc ingestion | PDF/DOCX/TXT only |
| Fine-tuning dataset upload UI | Requires storage file key |
| Admin AI analytics page | Static UI |
| Admin AI models page | Static UI |
| Qdrant vector delete on document remove | Missing |

### Voice

| Feature | Status |
|---------|--------|
| Campaign dial queue worker | `start()` marks RUNNING but no outbound dials |
| TTS synthesize (`POST /voice/synthesize`) | Returns queued placeholder |
| Audio transcribe (`POST /voice/transcribe`) | Returns pending placeholder |
| Full IVR multi-digit menu | Single human fallback only |
| Recording archival to MinIO | Twilio URLs only |
| Per-tenant Twilio webhook auth | Uses global `TWILIO_AUTH_TOKEN` |

### WhatsApp

| Feature | Status |
|---------|--------|
| Phone numbers CRUD (`/whatsapp/numbers`) | Documented, not implemented |
| Outbound media messages | Not implemented |
| Media download from Meta | Not implemented |
| Flow runtime engine | Builder persists; no execution on inbound |
| Template API sends in broadcast | Plain text only |
| Dedicated `whatsapp_conversations` table | Uses Contact custom fields |
| Per-tenant Meta credentials in service | Global env vars only |
| Admin WhatsApp metrics page | Mock UI |

### Workflows

| Feature | Status |
|---------|--------|
| Visual workflow builder (functional) | `/workflows/builder` is static mock |
| Condition branching (ifTrue/ifFalse paths) | Single-path executor only |
| Inbound webhook trigger endpoint | No public secret-validated route |
| Scheduled/cron triggers | Metadata only |
| LEAD_CREATED event emitter | Listed in metadata; not wired |
| WHATSAPP_MESSAGE_RECEIVED listener | Not wired |
| AI actions (AI_CHAT / AI_RESPONSE) | Returns SKIPPED |
| SMS action | Not implemented |
| Per-step retryCount config | Design doc field ignored |

### CRM

| Feature | Status |
|---------|--------|
| Segment rule evaluation engine | Rules stored but not evaluated |
| Lead scoring API integration | Page may not call scoring API |
| Custom fields entity-type server filter | Not enforced |
| Dedicated `/crm/timeline` backend | Uses activities list |

### Marketplace

| Feature | Status |
|---------|--------|
| Vendor entity + developer portal | `vendorId` string only |
| OAuth 2.0 install flow | Direct DB install only |
| Stripe Connect payout automation | Designed, not built |
| Stripe subscription item on premium install | Guard only |
| Plugin webhook subscriptions on install | Not implemented |
| UI extension manifest injection | Not implemented |
| Marketplace verification workflow API | UI only |
| Category CRUD API | UI only |
| Workflow template packs as marketplace items | Not implemented |

### Analytics

| Feature | Status |
|---------|--------|
| SuperAdmin growth time-series API | Charts use `dummyChartData` |
| SuperAdmin cluster resource metrics | Hardcoded percentages |
| KPI trend badges | Static +12%, +48 |
| Async export job endpoint | `/analytics/export` is CRM export only |

### Infrastructure

| Feature | Status |
|---------|--------|
| Prometheus `/metrics` endpoint | TASK-033 |
| CloudWatch / Grafana dashboards | Not in repo |
| ELK/Loki log aggregation | Docker stdout only |
| MinIO bucket bootstrap job | Manual creation required |
| Qdrant in CI | RAG tests may skip |
| Frontend unit/E2E tests in CI | Missing |
| Migration run in CI | Missing |
| SAST / dependency audit in CI | Missing |
| Deploy rollback strategy | Manual only |
| Redis AOF persistence | Default off — queue loss risk |
| Qdrant snapshot schedule | Missing |
| RTO/RPO documentation | Missing |

### Marketing

| Feature | Status |
|---------|--------|
| Contact form backend API | UI-only submit |
| `public/og-image.png` and `public/logo.png` | Referenced but missing |
| FAQ schema on pricing | Not added |

---

## Missing API Endpoints (Summary)

| Endpoint | Domain |
|----------|--------|
| `/auth/sso/*` (SAML/OIDC) | Auth |
| `/whatsapp/numbers` CRUD | WhatsApp |
| `/workflows/webhook/:secret` (inbound trigger) | Workflow |
| `/billing/refund` (admin manual) | Billing |
| `/billing/coupons/*` | Billing |
| `/admin/backups` (real pg_dump) | Infra |
| `/admin/restore` (real restore) | Infra |
| `/analytics/metrics/timeseries` (platform growth) | Analytics |
| `/voice/synthesize` (real TTS) | Voice |
| `/voice/transcribe` (real transcription) | Voice |
| DELETE global/tenant feature flags | Feature Flags |

---

## Missing Frontend Pages (Summary)

| Page | Route | Backend Ready |
|------|-------|---------------|
| Feature Flags Admin | `/superadmin/feature-flags` | ✅ |
| Pricing Settings | `/superadmin/pricing` | ✅ |
| Usage Dashboard | `/superadmin/usage` | ✅ |
| Tenant Detail | `/superadmin/tenants/[id]` | ✅ |
| Tenant Create | `/superadmin/tenants/new` | ✅ |
| Plan Editor | `/superadmin/plans/[id]/edit` | ✅ |
| Platform Limits | `/superadmin/limits` | ✅ |
| Tenant Overrides | `/superadmin/tenants/[id]/overrides` | ✅ |
| User Create/Edit | `/superadmin/users/new`, `[id]/edit` | ✅ |
| Billing Upgrade | `/billing/upgrade` (wired) | ✅ |
| Billing Usage | `/billing/usage` (wired) | ✅ |
| Workflow Visual Builder | `/workflows/builder` (functional) | ✅ |
| SSO Settings (functional) | `/settings/workspace/sso` | ❌ |

---

## Missing Integrations

| Integration | Status |
|-------------|--------|
| PayPal | Not implemented |
| Razorpay | Not implemented |
| Stripe Connect (marketplace payouts) | Not implemented |
| SAML/OIDC IdPs | Not implemented |
| Anthropic Claude | Not implemented |
| Notion / Google Docs (AI ingestion) | Not implemented |
| Stripe metered prices | Not implemented |

---

## Missing Test Coverage (Critical Gaps)

| Area | Status |
|------|--------|
| Super Admin HTTP integration tests | ❌ None |
| Admin module unit tests | ❌ None |
| Auth refresh/logout/MFA E2E | ❌ None |
| Billing webhook idempotency | ❌ None |
| Wallet unit tests | ❌ None |
| Feature flag hierarchy E2E | ❌ None |
| Marketplace install E2E | ❌ None |
| Voice webhook/WebSocket E2E | ❌ None |
| Workflow branching E2E | ❌ None |
| Frontend unit/E2E (all modules) | ❌ None in CI |
