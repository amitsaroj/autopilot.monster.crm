# Enterprise CRM Baseline Matrix

Last verified: 2026-07-22  
Status values: `Implemented` / `Partial` / `Missing` / `Deferred` / `Rejected`

| Capability | Status | Rationale |
|---|---|---|
| Multi-tenancy | Implemented | Tenant isolation via guards + TypeORM tenant scoping |
| Authentication (JWT/OAuth/MFA) | Implemented | Auth module; MFA login + settings enrollment; OAuth strategies env-gated |
| Authorization / RBAC | Implemented | Roles, permissions, resource guards |
| Organizations / Teams / Users | Implemented | Tenant + team + users modules |
| Tenant switch UX | Missing | Session binds one tenant; no switcher UI (not required for single-workspace tenants) |
| Contacts / Companies / Leads / Deals / Pipelines | Implemented | CRM APIs + UI; pipelines list lacks server pagination (Partial depth only) |
| Activities / Tasks / Calendar | Partial | Tasks complete; activities API without list pagination |
| Products / Quotes | Implemented | Product/quote modules + UI; deterministic quote numbers |
| Invoices / Payments / Subscriptions | Implemented | Stripe billing; live price IDs are ops Deferred |
| Wallet / Credits | Implemented | Wallet APIs + UI |
| PayPal / Razorpay | Deferred | Explicit unavailable stubs; not in launch scope |
| Notifications / Email / SMS | Implemented | Notification APIs + queue processors; admin email settings wired |
| WhatsApp | Implemented | Cloud API + keyword/broadcast flows; live Meta provisioning ops |
| Voice | Implemented | Dialer, campaigns, STT/TTS/sentiment; ElevenLabs clone optional |
| AI Agents / KB / RAG / Prompts | Implemented | File RAG + URL crawl + real KB analytics |
| Automation / Workflow Builder | Implemented | Bull workflow runtime |
| Marketplace / Plugins | Implemented | MarketplaceModule + templates |
| Analytics / Dashboards / Reports | Implemented | Analytics APIs + PDF; custom builder depth not prioritized |
| Audit Logs | Implemented | Auth + CRM mutation emitters |
| Settings / Admin / Super Admin | Implemented | Admin/superadmin surfaces; telemetry/demo redirect to real metrics |
| White-label branding | Implemented | Workspace + admin branding persist via tenant branding API |
| Feature Flags / API Keys / Webhooks | Implemented | Tenant flags + developer module |
| Imports / Exports / Search | Implemented | Import/export hubs + FTS search index queue |
| File / Media storage | Implemented | MinIO + storage UI |
| Backup / Restore | Implemented | Tenant backup APIs; admin backups list MinIO/in-memory (no fake seeds) |
| Health / Queue / System monitoring | Implemented | Health endpoints + admin/superadmin queues/workers |
| Cost monitoring | Implemented | Admin cost/usage surfaces |
| Dedicated queue-worker fleet | Rejected | In-process Bull processors for current stage |
| Playwright E2E suite | Deferred | Explicit no-new-tests policy for this program |
| Multi-AZ / multi-region IaC | Deferred | Current target is single EC2 + compose |
| Live secret rotation in provider consoles | Deferred | Ops runbook `docs/OPS_RUNBOOKS.md` |
| Live Stripe price provisioning | Deferred | Ops runbook |
| Live DNS/TLS certificate cutover | Deferred | Ops runbook |
| Vendor portal / ratings / tax engine / device mgmt | Deferred | Not scaffolded beyond CRM core; out of launch scope |
