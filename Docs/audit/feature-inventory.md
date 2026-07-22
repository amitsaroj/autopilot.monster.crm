# Feature Inventory

**Audit date:** 2026-07-22  
**Status legend (ONLY):** ✅ Complete | 🟡 Partial | 🔴 Missing | ⚫ Broken  

**DoD note:** ✅ requires Backend + DB + Migration + API + Frontend connected + Validation + Permissions + Audit logging + Error handling + Unit tests + Integration tests + Production ready.  
**Global blockers for ✅:** audit write path broken (`PlatformModule` missing `AuditLog` in `forFeature`; zero `audit.log` emitters); no frontend automated tests; CRM/`any` DTO gaps; prod compose/TLS defects.

| ID | Module | Feature | Status | Evidence | Dependencies | Owner | Priority |
|----|--------|---------|--------|----------|--------------|-------|----------|
| F-001 | Auth | Login / register / refresh / logout | 🟡 Partial | `backend/src/modules/auth/*`; `frontend/src/app/(auth)/login/page.tsx`; `test/integration/auth-login-http.integration.spec.ts` | JWT, Tenant, Redis sessions | Auth | Critical |
| F-002 | Auth | OAuth (Google/FB/GitHub/Apple) | 🟡 Partial | `modules/auth/guards/`, strategies; env OAuth vars in `.env.example` | Auth, external IdPs | Auth | High |
| F-003 | Auth | MFA (TOTP) | 🟡 Partial | `modules/auth/mfa.service.ts`; `(auth)` MFA page | Auth | Auth | High |
| F-004 | Auth | Legacy root auth tree | ⚫ Broken | Duplicate unused `backend/src/auth.module.ts`, `src/strategies/*`, `src/entities/*` vs `modules/auth` | — | Auth | Medium |
| F-005 | Tenant | Multi-tenant lifecycle & isolation | 🟡 Partial | `modules/tenant/*`; `test/integration/tenant-isolation.integration.spec.ts`, `cross-tenant-http` | Auth, TypeORM | Tenant | Critical |
| F-006 | Tenant | Tenant settings / branding | 🟡 Partial | `modules/tenant-settings/*`; FE `settings/*` | Tenant | Tenant | High |
| F-007 | RBAC | Roles / permissions / assignment | 🟡 Partial | `modules/rbac/*`; `PermissionGuard`; migrations `1740000000002/3`; `rbac-http.integration.spec.ts`; FE `use-permission.ts` | Auth, Tenant | Security | Critical |
| F-008 | Users | User CRUD / invite | 🟡 Partial | `modules/users/*`; invite DTO; FE admin/users | Auth, Tenant | Users | High |
| F-009 | Users | User groups API | ⚫ Broken | `@Get(':id')` before `@Get('groups')` in `users.controller.ts` — `/users/groups` captured as id | Users | Users | Critical |
| F-010 | CRM | Contacts | 🟡 Partial | Entity `contact.entity.ts`; `CrmController`; FE `(app)/crm/contacts/*`; integration CRM CRUD | CRM | CRM | Critical |
| F-011 | CRM | Companies | 🟡 Partial | `company.entity.ts`; CRM APIs; FE `crm/companies`; `crm-companies-http` | CRM | CRM | High |
| F-012 | CRM | Leads + conversion | 🟡 Partial | `lead.entity.ts`; lead conversion service; FE `crm/leads`; `crm-leads-http` | CRM, Contacts | CRM | Critical |
| F-013 | CRM | Deals + pipeline stages | 🟡 Partial | `deal.entity.ts`; deal service events; FE `DealBoard.tsx`; `crm-deals-http`, `deal-lifecycle` | Pipelines | CRM | Critical |
| F-014 | CRM | Pipelines | 🟡 Partial | `pipeline*.entity.ts`; FE `crm/pipelines`; `crm-pipelines-http` | CRM | CRM | High |
| F-015 | CRM | Campaigns | 🟡 Partial | `campaign.entity.ts`; FE `crm/campaigns`; `crm-campaigns-http` | CRM | CRM | Medium |
| F-016 | CRM | Products | 🟡 Partial | `product.entity.ts`; FE products; `crm-products-http` | CRM | CRM | Medium |
| F-017 | CRM | Quotes (+ public view) | 🟡 Partial | `quote.entity.ts`; `QuotePublicController`; FE quote pages + public token route; `crm-quotes-http`, `quote-public-http` | CRM | CRM | High |
| F-018 | CRM | Tasks / notes / activities / tags / segments | 🟡 Partial | Entities + CrmController handlers; FE pages under `crm/*` | CRM | CRM | Medium |
| F-019 | CRM | CRM reports / dashboard API | 🟡 Partial | `CrmReportsController`; FE `crm/dashboard` wired to reports | CRM | CRM | High |
| F-020 | CRM | Duplicate detection / merge | ⚫ Broken | `DuplicateController` exists but not registered in wired CrmModule | CRM | CRM | High |
| F-021 | CRM | Main tenant dashboard `/dashboard` | ⚫ Broken | Hardcoded stats — `frontend/src/app/(app)/dashboard/page.tsx` (no API) | Analytics/CRM | Frontend | Critical |
| F-022 | Omnichannel | Unified inbox | ⚫ Broken | Stub `omnichannel.service.ts` + unwired controller; FE `inbox/page.tsx` mock data | WhatsApp/Voice | Omnichannel | Critical |
| F-023 | WhatsApp | Conversations / messages / webhook | 🟡 Partial | `WhatsappModule`, `MetaWebhookController`; FE `whatsapp/page.tsx`; `whatsapp-http` / `whatsapp-read-http` | Meta, Redis queue | WhatsApp | Critical |
| F-024 | WhatsApp | Broadcasts / templates | 🟡 Partial | `WhatsappBroadcastProcessor`; SLA/flow stubs in `whatsapp.service.ts`; FE broadcast/template pages | WhatsApp | WhatsApp | High |
| F-025 | Voice | Twilio calls / numbers / campaigns | 🟡 Partial | `VoiceModule`, `TwilioController` path `v1/voice/twilio` → double `api/v1/v1/...`; sentiment/clone stubs; FE `voice/*`; voice integration specs | Twilio | Voice | High |
| F-026 | AI | Agents / chat / conversations | 🟡 Partial | `AiModule` controllers; FE `ai/agents`, `ai/chat`; `ai-agents-read-http`, `ai-platform-http` | OpenAI | AI | High |
| F-027 | AI | Knowledge bases / RAG (Qdrant) | 🟡 Partial | KB controller + Qdrant; crawl/analytics stubs in `rag.service.ts`; FE `ai/knowledge-base` | MinIO, Qdrant | AI | High |
| F-028 | AI | Prompts / fine-tuning | 🟡 Partial | Controllers wired; `PromptTemplateController` **unwired**; FE pages exist | AI | AI | Medium |
| F-029 | AI | AI hub usage KPIs | ⚫ Broken | Mock usage on `(app)/ai/page.tsx` | AI | Frontend | Medium |
| F-030 | Workflow | Workflow CRUD / executor | 🟡 Partial | BullMQ `'workflows'` vs registry `'workflow'`; unit specs on executors; `workflow-*-http` | Redis | Workflow | High |
| F-031 | Billing | Stripe subscriptions / webhooks / wallet | 🟡 Partial | `BillingService`, monetization module; FE `billing/*`; billing integration specs; seed placeholder Stripe price IDs | Stripe | Billing | Critical |
| F-032 | Billing | Razorpay / PayPal / coupons ext | ⚫ Broken | Stub services; `BillingExtController` / coupons not in `MonetizationModule` | Billing | Billing | Medium |
| F-033 | Billing | Plans nav `/billing/plans` | 🔴 Missing | Sidebar link in `sidebar.tsx`; no `page.tsx` | Billing FE | Frontend | Medium |
| F-034 | Marketplace | Plugin catalog / install | 🟡 Partial | Via `PlatformModule` marketplace/plugins; `marketplace-http`, `plugins-http`; FE marketplace pages | Plugins | Platform | Medium |
| F-035 | Marketplace | Marketplace templates module | ⚫ Broken | `modules/marketplace/marketplace.module.ts` not in CoreModule | Platform | Platform | Low |
| F-036 | Search | Platform search API | 🟡 Partial | `SearchController`/`SearchService`; `search-http`; FE admin search wired; tenant `/search` mock | CRM entities | Platform | High |
| F-037 | Search | Tenant global search UI | ⚫ Broken | Static results — `(app)/search/page.tsx` | Search API | Frontend | High |
| F-038 | Notifications | In-app notifications + gateway | 🟡 Partial | `NotificationModule` + gateway; FE notifications; `notifications-http` | Events | Notifications | Medium |
| F-039 | Analytics | Dashboards / reports | 🟡 Partial | Analytics controllers + FE pages; integration specs; `AdvancedAnalyticsController` unwired/stub | CRM | Analytics | Medium |
| F-040 | Data Jobs | Import / export / backup APIs | 🟡 Partial | `data-jobs` + Bull processors; integration specs; entity CSV modal; **hub pages mock** | MinIO, Redis | Data | High |
| F-041 | Data Jobs | Import/Export hub UI | ⚫ Broken | `(app)/import/page.tsx`, `export/page.tsx` — no service calls; `import-export.service.ts` unused by hubs | Data Jobs | Frontend | High |
| F-042 | Storage | MinIO file storage | 🟡 Partial | `storage/*`; `storage-files-http`; used by AI/data-jobs | MinIO | Infra | High |
| F-043 | Support | Tickets / KB articles | 🟡 Partial | `SupportModule`; FE support routes if present; `support-http` | Tenant | Support | Low |
| F-044 | Social | Social post scheduling | 🟡 Partial | `SocialModule` + `@Cron` scheduler; `social-http` | OAuth social | Social | Low |
| F-045 | Scheduler | Scheduled jobs API | 🟡 Partial | `SchedulerModule`; `scheduler-http` | Redis/cron | Platform | Medium |
| F-046 | Developer | Webhooks / OAuth apps / API logs | ⚫ Broken | `DeveloperModule` **not** imported in `app.module.ts`; FE `developer.service.ts` orphaned | Tenant settings overlap | Developer | High |
| F-047 | Admin | Platform admin suite | 🟡 Partial | Large `AdminModule` (~50 controllers); FE `admin/*` + `superadmin/*`; thin dedicated tests; many admin pages use unauthenticated `fetch('/api/v1/...')` | RBAC | Admin | Critical |
| F-048 | Sub-admin | Tenant sub-admin suite | 🟡 Partial | `SubAdminModule` (~15 controllers); FE sub-admin services | RBAC, Tenant | Admin | Medium |
| F-049 | Audit | Audit log write + read | ⚫ Broken | Entity + read APIs; `AuditLogService` `@OnEvent('audit.log')` but **no emitters**; `PlatformModule` omits `AuditLog` from `forFeature` | Events, TypeORM | Security | Critical |
| F-050 | Email | SMTP transactional email | 🟡 Partial | `shared/email/email.service.ts`; SMTP vars **absent** from `.env.example` | Nodemailer | Infra | High |
| F-051 | Health | Health checks | 🟡 Partial | `HealthController` + `health-http`; Terminus; no product FE | Infra | Infra | Medium |
| F-052 | Queues | Declared platform queues | 🟡 Partial | `queue.constants.ts` many names; processors only WhatsApp broadcast, import/export, workflow (name mismatch) | Redis | Infra | Critical |
| F-053 | Marketing | Public marketing site | 🟡 Partial | `(marketing)/*` static complete-ish; not product DoD | — | Frontend | Low |
| F-054 | Frontend QA | Automated FE tests | 🔴 Missing | No `*.test.*` / `*.spec.*` / Playwright/Vitest in frontend | — | Frontend | Critical |
| F-055 | Infra | Local Docker Compose | 🟡 Partial | `docker-compose.yml` (postgres/redis/minio/qdrant/api/ui) | Docker | Infra | High |
| F-056 | Infra | Prod Compose + nginx TLS | 🟡 Partial | Single `postgres`; `ui`+`ssl-init`; HTTPS in `nginx.conf` (`/api/`→api, `/`→ui); LE cutover + GHCR image supply still ops | Deploy | Infra | Critical |
| F-057 | Infra | Terraform / AWS topology | 🟡 Partial | Single EC2 stub; README claims Fargate/RDS/Vercel — **not implemented** | AWS | Infra | High |
| F-058 | CI/CD | GitHub Actions CI + deploy | 🟡 Partial | `ci.yml` backend-heavy; `deploy.yml` API-only, fire-and-forget SSM | GHCR, AWS | Infra | High |
| F-059 | Secrets | Env hygiene | ⚫ Broken | Tracked `backend/.env.production`, `frontend/.env`; `DB_SYNCHRONIZE=true`; root `.env.example` missing | Git | Security | Critical |
| F-060 | Docs | Architecture / FRD / TDD | 🟡 Partial | Only `Docs/{HLD,LLD,security,crm_design,README}.md`; layout obsolete vs monorepo | — | Docs | Low |
| F-061 | Settings | `/settings/data` page | 🔴 Missing | Linked from settings hub; no page | Settings | Frontend | Medium |
| F-062 | Pagination | List pagination (app-wide) | 🔴 Missing | Lists load full arrays; client filter only (FE audit) | API query params | Frontend/CRM | High |

---

## Status counts (inventory rows)

| Status | Count |
|--------|------:|
| ✅ Complete | **0** |
| 🟡 Partial | **46** |
| 🔴 Missing | **4** |
| ⚫ Broken | **12** |
| **Total** | **62** |

Zero ✅ under strict DoD (audit trail non-functional + FE tests absent + prod gaps).
