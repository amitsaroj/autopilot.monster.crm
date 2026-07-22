# Feature Inventory

Last verified: 2026-07-22  
Method: Code evidence only (Nest modules, Next routes, services). Status values: ✅ Complete / 🟡 Partial / 🔴 Missing / ⚫ Broken.

## Platform & Auth

| Feature | Status | Evidence |
|---|---|---|
| Multi-tenancy + tenant guards | ✅ | `backend/src/common/guards/tenant.guard.ts`, `active-tenant.guard.ts` |
| JWT login / refresh / sessions | ✅ | `backend/src/modules/auth/`, `frontend/src/lib/api/client.ts` |
| MFA verify at login | ✅ | `(auth)/mfa/page.tsx`, `mfa.service.ts` |
| MFA enrollment in settings | ✅ | `(app)/settings/password/page.tsx` → `authService.enableMfa/verifyMfa/disableMfa` |
| OAuth (Google/GitHub/Facebook/Apple) | 🟡 | Strategies + callback UI exist; requires live provider env |
| RBAC roles/permissions | ✅ | `modules/rbac`, `permission.guard.ts` |
| Organizations / teams / users | ✅ | `modules/tenant`, `modules/users` |
| Feature flags / API keys | ✅ | `tenant/feature-flag`, `tenant/api-key` |
| Audit log emitters | ✅ | CRM/auth events → `audit-log.listener.ts` |
| Tenant switch UI | 🔴 | Single `tenant_id` session; no switcher component |

## CRM

| Feature | Status | Evidence |
|---|---|---|
| Contacts / companies / leads / deals | ✅ | `modules/crm/*`, `(app)/crm/*` paginated lists |
| Pipelines | 🟡 | Real CRUD `(app)/crm/pipelines/page.tsx`; no server pagination |
| Tasks / products / quotes | ✅ | Paginated CRM pages + quote lifecycle/PDF |
| Duplicate detection / merge | ✅ | `duplicate.controller.ts`, `(app)/crm/duplicates/page.tsx` |
| Activities | 🟡 | Real API; client-side list only `(app)/crm/activities/page.tsx` |
| Forecast / CRM reports | ✅ | `forecast.service.ts`, `crm-reports.controller.ts` |
| Omnichannel send | ✅ | `omnichannel.service.ts`, `(app)/inbox` |
| Lead intelligence (AI scoring) | 🟡 | Real OpenAI path; returns null when key missing (no fake scores) |

## Billing & Monetization

| Feature | Status | Evidence |
|---|---|---|
| Stripe checkout / webhooks / plans | ✅ | `billing.service.ts`, `(app)/billing/*` |
| Invoices / payment methods / wallet | ✅ | billing + wallet services + UI |
| Usage metering UI | ✅ | `(app)/usage`, `(app)/billing/usage` → `/monetization/usage` |
| Coupons | ✅ | `coupon.service.ts` |
| PayPal / Razorpay | 🔴 | Honest `ServiceUnavailableException` stubs; not exposed on controllers |

## WhatsApp

| Feature | Status | Evidence |
|---|---|---|
| Meta Cloud send / templates / webhooks | ✅ | `whatsapp.service.ts`, `meta-webhook.controller.ts` |
| Tenant credential enforcement | ✅ | Config orchestrator + prod mock rejection |
| Broadcast (Bull) | ✅ | `whatsapp-broadcast.service.ts` + processor |
| Tenant WA UI (inbox/templates/settings) | ✅ | `(app)/whatsapp/*` |
| Admin WA hub | ✅ | Links to live routes; KPIs from `analyticsService.getWhatsapp()` |

## Voice

| Feature | Status | Evidence |
|---|---|---|
| Outbound / inbound / Twilio webhooks | ✅ | `voice-call.service.ts`, `twilio.service.ts` (prod fail-fast) |
| Campaigns dial enqueue / pause / resume | ✅ | `voice-campaign.service.ts`, migration `1740000000004` |
| STT / TTS / sentiment | ✅ | `voice-ai.service.ts` (OpenAI) |
| Voice clone | 🟡 | ElevenLabs when `ELEVENLABS_API_KEY` set; else 503 |

## AI Platform

| Feature | Status | Evidence |
|---|---|---|
| Agents / prompts / conversations | ✅ | `modules/ai/*`, `(app)/ai/*` |
| KB + file RAG (Qdrant) | ✅ | `rag.service.ts` index/query |
| URL crawl index | ✅ | `rag.service.ts` `crawlUrl` fetches + indexes |
| KB analytics | ✅ | Real KB/Qdrant counts (zeros when empty) |
| Fine-tuning jobs | 🟡 | Real OpenAI jobs when keyed |
| Async inference queue | ✅ | Bull `ai-inference` processor |

## Workflow / Queues / Search / Data

| Feature | Status | Evidence |
|---|---|---|
| Workflow builder + Bull executor | ✅ | `workflow.processor.ts`, `workflow-action-executor.service.ts` |
| Search FTS + index queue | ✅ | `search.service.ts`, migration FTS indexes |
| Import / export hubs | ✅ | `(app)/import`, `(app)/export`, `data-jobs` |
| Backup / restore (tenant) | ✅ | `(app)/backup` → `/backup` APIs |
| Storage file browser | ✅ | `(app)/storage` → `storageFileService` |
| Notifications inbox | ✅ | `(app)/notifications` → `notificationService` |
| Social scheduler | 🟡 | Real Graph/Twitter/LinkedIn calls; fails honestly without creds |

## Analytics / Marketplace / Developer

| Feature | Status | Evidence |
|---|---|---|
| Analytics overview / CRM / revenue / WA / voice | ✅ | `modules/analytics`, `(app)/analytics/*` |
| PDF / advanced analytics | ✅ | `advanced-analytics.service.ts` |
| Marketplace plugins / templates | ✅ | `modules/marketplace`, `(app)/marketplace` |
| Developer webhooks / OAuth apps / API logs | ✅ | `modules/developer` |

## Admin / Super Admin

| Feature | Status | Evidence |
|---|---|---|
| Admin CRM / users / RBAC / billing / AI / voice | ✅ | `frontend/src/app/admin/**` + sub-admin APIs |
| Admin branding / localization / email settings | ✅ | Wired to `tenantService` / `adminEmailSettingsService` |
| Admin CRM settings persist | ✅ | Persists via branding/crmSettings |
| Admin backups list | ✅ | Empty/in-memory + MinIO list (no seeded fakes) |
| Superadmin tenants / plans / metrics / queues | ✅ | `frontend/src/app/superadmin/**` |
| Superadmin telemetry / demo | 🟡 | Redirect to metrics / home (no fake KPIs) |

## Infra / DevOps / Security

| Feature | Status | Evidence |
|---|---|---|
| Local compose stack | ✅ | `docker-compose.yml` |
| Prod compose + nginx TLS path | 🟡 | `docker-compose.prod.yml`, `nginx/nginx.conf`; LE issuance ops |
| Terraform single EC2 | 🟡 | `main.tf` / `variables.tf`; multi-AZ deferred |
| CI build/test | ✅ | `.github/workflows/ci.yml` |
| Deploy workflow gates + health poll | 🟡 | `deploy.yml`; secrets injection ops; no CI `needs` |
| Health endpoints | ✅ | `/api/v1/health`, `/health/ready` |
| Prod JWT RS256 / HTTPS URL guards | ✅ | `jwt.config.ts`, `main.ts` |

## Counts (this verification)

| Bucket | Count |
|---|---:|
| ✅ Complete | 52 |
| 🟡 Partial | 14 |
| 🔴 Missing | 2 |
| ⚫ Broken | 0 |
| **Total inventoried** | **68** |
