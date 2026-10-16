# Autopilots Monster CRM

Autopilot Monster CRM is a multi-tenant, AI-oriented CRM and communications platform. The repository contains a Next.js UI, a NestJS API, PostgreSQL schema/migrations, Redis/Bull job processing, MinIO storage, Qdrant configuration, Docker Compose, Terraform, nginx, and GitHub Actions.

This README describes the checked-in implementation as of 2026-10-16. It does not imply that third-party services are configured or production-ready.

## Product vision

The product combines CRM data, tenant-aware access controls, subscriptions, automated workflows, AI assistance, voice, WhatsApp, analytics, and platform administration so organizations can operate sales and customer workflows from one system.

## Current project status

Implementation evidence is present across API, UI, data, and infrastructure artifacts. This repository is not a production-readiness certification: deployment, third-party provider validation, operational controls, and acceptance checks are environment-specific.

| Area | Evidence | Operational note |
|---|---:|---|
| Product areas | Evidence | Operational note |
|---|---|---|
| CRM, authentication, workflows, AI, voice, WhatsApp, billing, analytics, marketplace and administration | API modules, UI routes, entities, migrations and queues are checked into this repository | Scope varies by feature; see [Feature Catalog](docs/FEATURE_CATALOG.md) and each module's documentation |
| Infrastructure and deployment | Docker Compose, nginx, Terraform and GitHub Actions are present | These artifacts do not prove a live deployment, disaster recovery, alerting, or scale readiness |

Implementation evidence is not acceptance-test results or a go-live approval. See [HLD](docs/HLD.md), [LLD](docs/LLD.md), and the [feature catalog](docs/FEATURE_CATALOG.md) for scope and limitations.

### Recent repository fixes

- The tenant admin panel (`/admin`) previously exposed only 3 sidebar links even though 74 `page.tsx` routes already existed under it; it now has a dedicated `AdminSidebar` covering all of them, grouped by domain.
- The global `TransformInterceptor` wraps every controller response once; nearly every controller across the backend (`admin/*`, `sub-admin/*`, `crm`, `analytics`, `social`, `billing`, ...) additionally wrapped its own return value, producing a doubly-nested payload the frontend couldn't parse. Fixed across ~97 controller files.
- JWT `permissions` were decoded but never stored on the client auth user object, so every permission-gated sidebar item and route silently disappeared regardless of role.
- A JWT embedding a role's full flat permissions list can exceed the ~4KB browser per-cookie limit (TENANT_ADMIN's did, once RBAC/social/support/etc. permissions were backfilled) — the browser silently drops the cookie and login breaks. `access_token`/`refresh_token` are now split across numbered cookies and rejoined on read (`frontend/src/lib/cookie-chunks.ts`).
- Local schema drift (existing migrations never applied, plus a missing `prompt_templates` table and a `tenant_plugins.pluginId`/`plugin_id` mismatch) 500'd several admin endpoints; closed with migrations `1740000000006`–`1740000000009`.
- `PlanGuard`/`LimitGuard` resolved `PricingService`/`BillingService` by a string token that never matched their real DI token, `PlanGuard` crashed on `@Public()` routes, and the Enterprise/Pro/Starter/Free plans were missing feature flags (`billing`, `storage`, `export`, `import`) added to the seed script after those plans were first created — all three blocked or 403'd real pages regardless of role.
- The `@Roles('ADMIN')` sub-admin tier (14 controllers) had no seeded role or demo user, so it was completely unreachable; added the `ADMIN` role and `subadmin@autopilotmonster.com`.

See [`Docs/audit/FEATURE_COVERAGE_MATRIX.md`](Docs/audit/FEATURE_COVERAGE_MATRIX.md) and [`Docs/audit/UI_AUDIT.md`](Docs/audit/UI_AUDIT.md) for what these fixes change relative to the last full audit (2026-07-22).

## Architecture summary

```text
Browser → nginx → Next.js UI
                 → NestJS API (/api/v1)
                       ├─ PostgreSQL (TypeORM)
                       ├─ Redis (cache, throttling, Bull)
                       ├─ MinIO (object storage)
                       ├─ Qdrant (RAG vectors)
                       └─ Stripe / Twilio / Meta / OpenAI / SMTP
```

The deployment model in this repository is a modular monolith on one Docker Compose host. Bull processors run in the API process; there is no standalone worker service or Kubernetes deployment.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, TanStack Query, Axios |
| Backend | NestJS 11, TypeORM, class-validator, Swagger, Passport, EventEmitter2 |
| Data/async | PostgreSQL 15, Redis 7, Bull 4 via `@nestjs/bull` |
| Storage/AI | MinIO, Qdrant, OpenAI SDK |
| Communications/billing | Meta WhatsApp Cloud API, Twilio, SMTP, Stripe |
| Operations | Docker Compose, nginx, Terraform (AWS), GitHub Actions, Sentry/Winston |

## Repository structure

```text
.
├── backend/                  # NestJS API, entities, migrations, queue processors
├── frontend/                 # Next.js App Router UI, components and API services
├── docs/                     # Architecture and feature documentation
├── nginx/                    # Production reverse-proxy configuration and TLS mount
├── docker-compose.yml        # Local services: API, UI, DB, Redis, MinIO, Qdrant
├── docker-compose.prod.yml   # Production-shaped single-host stack
├── *.tf                      # AWS EC2/SSM/EIP Terraform configuration
└── .github/workflows/        # CI and prod deployment workflows
```

## Local development

### Prerequisites

- Node.js 20 (CI version)
- Docker Engine with Docker Compose
- npm

### Install and run

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up -d postgres redis minio qdrant

cd backend && npm ci
cd ../frontend && npm ci
```

**Important:** `backend/src/config/env.config.ts` reads `process.env` directly at module-import time — nothing in the app calls `dotenv.config()` before that happens, so a `backend/.env` file alone is not enough to boot the API. Export it into the shell first:

```bash
cd backend
set -a && source .env && set +a
npm run migration:run   # first run only, or after pulling new migrations
npm run seed:dev        # idempotent — safe to re-run; seeds tenant, plans, RBAC, demo users/CRM data
npm run start:dev
```

In another terminal, point the frontend at the local API (`.env.local` defaults to the production API) and run it:

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
```

The default API is `http://localhost:8000/api/v1`; the UI is normally `http://localhost:3000`. The non-production Swagger UI is at `http://localhost:8000/api/docs`; OpenAPI JSON is `http://localhost:8000/openapi.json`.

To run the full local stack in containers instead:

```bash
docker compose up -d --build
curl -sf http://localhost:8000/api/v1/health/ready
```

#### Demo personas

`npm run seed:dev` creates one demo user per role, all sharing the password `SecureP@ssw0rd!`:

| Email | Role | Notes |
|---|---|---|
| `superadmin@autopilotmonster.com` | `SUPER_ADMIN` | Platform-wide control center at `/superadmin` |
| `admin@autopilotmonster.com` | `TENANT_ADMIN` | Tenant admin panel at `/admin` (74 pages across CRM, RBAC, billing, AI, voice, WhatsApp, workflows, social, support, settings, ...) |
| `subadmin@autopilotmonster.com` | `ADMIN` | Delegated sub-admin tier (`/sub-admin/*` API only — no dedicated frontend pages exist yet) |
| `manager@autopilotmonster.com` | `USER` (Sales Manager) | Workspace app at `/dashboard` |
| `user@autopilotmonster.com` | `USER` (Staff Member) | Workspace app at `/dashboard` |
| `agent@autopilotmonster.com` | `USER` + `AGENT` | Workspace app at `/dashboard`, scoped to CRM/voice/WhatsApp |

## Environment variables

Use the checked-in examples as the authoritative variable lists:

- Root compose defaults: `.env.example`
- Backend development: `backend/.env.example`
- Backend production: `backend/.env.production.example`
- Frontend: `frontend/.env.example` and `frontend/.env.production.example`

Important backend groups are:

| Group | Variables (examples) |
|---|---|
| App/security | `NODE_ENV`, `APP_PORT`, `APP_URL`, `FRONTEND_URL`, `JWT_*`, `THROTTLE_*` |
| Database/cache | `DATABASE_URL` or `DB_*`, `REDIS_*` |
| Storage/AI | `MINIO_*`, `QDRANT_*`, `OPENAI_API_KEY` |
| Providers | `STRIPE_*`, `TWILIO_*` where configured, `WHATSAPP_*`, `SMTP_*`, OAuth client settings |
| Frontend | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |

Never commit valid secrets. `docker-compose.prod.yml` expects a real `backend/.env.production` at deployment time; it is not supplied in this repository.

## Available scripts

```bash
# Backend
cd backend
npm run build
npm run typecheck
npm run lint:check
npm test
npm run test:integration
npm run migration:run
npm run seed:dev

# Frontend
cd frontend
npm run dev
npm run build
npm run lint
npm test
```

## Authentication, authorization and tenancy

The API uses a global `/api/v1` prefix. Requests generally use `Authorization: Bearer <token>` and `x-tenant-id`. The frontend client reads access/refresh tokens from cookies and the tenant ID from `localStorage`.

The Nest global request pipeline includes throttling, JWT authentication, tenant and active-tenant checks, roles, resource permissions, plan features and limits. Local auth, refresh, MFA, password/email flows and OAuth strategy paths for Google, Facebook, GitHub and Apple are implemented. OAuth requires deployment-specific credentials and callback URLs.

## Product modules

| Area | Implemented scope | Operational note |
|---|---|---|
| CRM | Contacts, companies, leads, deals, pipelines/stages, activities, tasks, notes, tags, segments, products, quotes, duplicates, forecasting | PostgreSQL-backed |
| AI | Agents, prompts/templates, conversations, KB, RAG, fine-tuning job records | OpenAI/Qdrant/MinIO required for relevant operations |
| Voice | Calls, campaigns, phone numbers, callbacks, queue processing | Twilio/provider setup required |
| WhatsApp | Connected Meta accounts, messages, templates, shared inbox, campaigns, consent, automation catalog, workflow actions, webhooks and analytics | Meta account/token/webhook required; use the detailed guide below and [implementation checkpoint](docs/whatsapp-automation-implementation.md) |
| Workflow | Flows, executions, action executor, events, processor and builder routes | Workers run in the API process |
| Billing | Plans, limits, subscriptions, invoices, payments, wallet, usage, coupons | Valid Stripe configuration required for payments |
| Analytics | Dashboards, reports, analytics event listener and queue | Depends on emitted domain events |
| Marketplace/developer | Plugins, templates, OAuth apps, webhooks, API logs | No sandboxed plugin runtime is present |
| Admin/platform | Tenant/user/RBAC/security/configuration/queue/log/system administration | Restricted by API RBAC |

The full feature-by-feature status, dependencies, and limitations are in [docs/FEATURE_CATALOG.md](docs/FEATURE_CATALOG.md).

## WhatsApp Business Platform and automation

This section describes the WhatsApp implementation in this repository as of 2026-10-16. It is a product and operator guide, not a promise that every use case in the master product vision is implemented. Features requiring Meta, Shopify, Stripe, AI credentials, approved templates, account permissions, or a public HTTPS callback are unavailable until those dependencies are correctly configured and verified. The [WhatsApp implementation checkpoint](docs/whatsapp-automation-implementation.md) is the source for the exhaustive API contract table, detailed per-area coverage matrix, verification notes, and remaining gaps.

### Customer-facing routes

| Route | Purpose |
|---|---|
| `/whatsapp` | Workspace overview |
| `/whatsapp/settings` | Connected accounts, phone-number/provider settings and capability-dependent setup |
| `/whatsapp/inbox` | Team inbox and conversation management |
| `/whatsapp/conversations/:id` | Conversation detail and agent actions |
| `/whatsapp/templates` | Template library, status and management |
| `/whatsapp/templates/new` and `/whatsapp/templates/:id` | Create/edit template drafts and inspect a template |
| `/whatsapp/broadcast` | Campaign listing and management |
| `/whatsapp/broadcast/new` and `/whatsapp/broadcast/:id` | Create, inspect, prepare and operate campaigns |
| `/whatsapp/consent` | Consent records, import, opt-out/suppression review and contact-level do-not-contact controls |
| `/whatsapp/analytics` | Date-filtered message, campaign, CSAT, SLA and workflow summaries |
| `/whatsapp/automations` | Tenant catalog and setup |
| `/whatsapp/automations/:slug` | Automation product detail and install/configuration |
| `/whatsapp/automations/installed` | Tenant installations and readiness |
| `/whatsapp/automations/installed/:id` | Installation configuration, lifecycle and execution history |
| `/whatsapp/flow-builder` | Shared workflow editor used for custom automation |
| `/product/whatsapp/automations` and `/product/whatsapp/automations/:slug` | Public automation discovery and product detail |

UI controls are guarded by tenant authentication, permissions, feature entitlements, connected-account capabilities and server-side validation. A visible product or integration listing is not proof of an enabled provider capability.

### Automation store: current catalog

The public/workspace catalog is generated from backend definitions and marketplace data. The checked-in registry has 20 definitions: 19 installable products and one explicitly unavailable Shopify cart-recovery product. The availability value describes the product implementation only; required services, plans, account credentials, recipient consent, and approved templates still apply.

| Catalog product | What the current pack does | Important boundary |
|---|---|---|
| Keyword welcome reply | Replies to an inbound greeting | Text response within the permitted service window |
| Opening hours and location | Answers configured hours/location keywords | Uses maintained reply content; no live location/availability source |
| Inbound lead capture | Creates a scored CRM lead and acknowledges the sender | Email is optional; phone comes from the inbound WhatsApp event |
| Sales team handoff | Assigns an inbound conversation and acknowledges | Uses a configured workspace teammate, not skills/availability routing |
| Appointment request intake | Creates a CRM follow-up task and acknowledges | Does not reserve a calendar slot |
| Support escalation | Assigns, notifies a teammate and acknowledges | Uses existing CRM/task/notification functionality |
| Conversation resolution | Acknowledges a resolution keyword and resolves the conversation | Requires an actual inbound keyword event |
| Deal stage notification | Sends an approved utility template on a CRM deal-stage event | Template and purpose-specific recipient eligibility required |
| Payment instructions reply | Replies with maintained payment instructions or an existing hosted link | Does not create, process or verify a payment |
| Manual customer follow-up | Sends an approved marketing template to a CRM recipient | Requires recorded marketing consent and explicit manual execution |
| Inbound team alert | Creates an internal teammate notification on a keyword | Internal notification, not a customer message |
| Shopify cart recovery | Listed as unavailable | Shopify checkout recovery actions are not implemented; checkout payloads deliberately omit recovery URL and customer identifiers |
| AI knowledge assistant | Uses an existing AI agent/knowledge base for inbound text; uncertain responses are handed to a teammate | Requires AI credentials/indexed KB; no broad media reasoning or autonomous commerce actions |
| Three-touch customer follow-up | Sends three approved template messages with durable delays and business hours | Stops on reply, opt-out or configured CRM conversion; recipient and template checks apply at send time |
| New CRM contact nurture | Starts the three-touch sequence on CRM contact creation | Requires a reachable phone and marketing opt-in |
| Follow-up reply timeout alert | Sends one approved marketing template, waits for a reply, then alerts on timeout | Does not send repeated follow-up messages |
| Real estate viewing inquiry intake | Assigns inquiry, creates task and acknowledges | Does not query listings or book a viewing |
| Education course inquiry intake | Saves a CRM note, alerts admissions and replies with configured content | Does not enroll a student or query a student system |
| Travel and hospitality inquiry intake | Assigns, creates follow-up task and acknowledges | Does not quote rates, check availability or confirm a reservation |
| Retail and service request intake | Saves a CRM note, notifies teammate and acknowledges | Does not check inventory, orders, refunds or service availability |

Industry coverage is therefore reusable inquiry intake for education, real estate, travel/hospitality, retail and service operations—not a claim of full vertical-specific integrations. Healthcare and financial use cases require their own security, consent, privacy and jurisdictional review and are not enabled as ready-made packs.

### Shared workflow engine and automation lifecycle

WhatsApp automations use the existing workflow engine rather than a separate WhatsApp execution system. Product installation creates a linked workflow draft; configuration edits return it to draft; activation validates and publishes a pinned workflow version. Disable/uninstall preserve execution history and any purchased entitlement. Paid checkout uses the existing Stripe and billing/entitlement system; checkout return alone does not grant an entitlement.

The shared editor supports trigger/action nodes, branches, connection editing, undo/redo, draft save, preview, publish, version snapshots, execution navigation, condition groups using AND/OR, and variable reference insertion. The variable helper checks placeholder syntax and unapplied edits; full static proof that every trigger-specific path exists is not available. The execution system uses durable workflow records and queue processing, pinned definitions/checkpoints, idempotency keys for supported side effects, delays and wait steps, retries, execution logs, pause/resume/cancel controls for eligible idle runs, and outbox-backed lifecycle events. A running external side effect cannot necessarily be interrupted after it starts.

Available WhatsApp-related workflow events include inbound message/keyword, conversation resolved/reopened, CRM contact creation, CRM lead creation, deal-stage changes, and supported billing lifecycle events. Event availability depends on the producing integration. The workflow executor includes WhatsApp template/text and supported content sends, assignment, CRM lead/task/note actions, notifications, AI knowledge chat, delay/wait/branching, and the Shopify order-status action described below. Do not assume that every trigger/action listed in the master product vision is wired to every connected business system.

### Inbox and customer support

The tenant inbox provides sender-phone-number-scoped threads, inbound/outbound message history, service-window visibility, account-compatible template selection, human replies, status/priority/tags, CRM contact context, internal notes, team read timestamps, manual assignment, team routing and tenant-serialized round-robin assignment. Redis-backed presence marks active members online for 60 seconds. Replies use an optimistic collision guard. Supported inbound media can be viewed through authenticated, tenant-owned media retrieval; outbound uploads are limited to the supported image/video/audio/document MIME allowlist, 5 MB images and a 16 MB uploader cap. A 20 MB cap applies to inbound media preview.

The inbox also supports bounded/paginated conversation and message history, sender-number-specific deep links, formula-safe full-history CSV export, SQL-aggregated summaries/response-time metrics, durable SLA escalation to the current assigned teammate, and idempotent 1–5 CSAT collection when the WhatsApp service window permits. Conversation resolution/reopening emits workflow and minimized developer-webhook events. Known limits: no safe conversation merge, skills-based routing or full agent-performance dashboard; SLA escalation is a single assigned-owner notification and does not escalate unassigned threads; offset pagination can shift while new messages arrive. True realtime agent presence beyond the current heartbeat model depends on infrastructure not represented by the heartbeat API.

### Campaigns and follow-up sequences

Broadcasts support approved-template messages, saved audience/recipient preparation, recipient eligibility checks, exclusions, normalized phone de-duplication, contact preference and consent suppression, frequency caps, preview, recipient outcomes, throttling, schedule/pause/resume/cancel, campaign duplication, detailed failure information, paginated recipients and bounded streaming formula-safe recipient CSV export. Optional team approval prevents self-review and is rechecked at activation, queue preparation and atomic recipient claim.

Scheduling supports one-time campaigns and bounded daily/weekly recurrence. Each occurrence is its own campaign record; series actions control occurrences. Optional recipient-local `HH:mm` scheduling uses saved IANA contact timezone, falling back to UTC for missing/invalid timezone. A recipient timezone is captured when that occurrence audience is prepared; a slow occurrence may overlap the next occurrence.

Shared workflow sequences support durable delays, reply/condition waits, branches, pinned versions, checkpoints/retries, business-hours windows with daylight-saving-aware timezone handling, optional recipient `whatsappTimezone`, and stop-on-reply/opt-out/conversion/goal rules where configured. Recipient eligibility is rechecked before a send. Current limitations: no campaign monetary budget without an authoritative live pricing source; no mature A/B testing or reliable conversion/revenue attribution; reads/replies depend on provider events; advanced sequence goal setup remains API-oriented; the builder does not provide a full campaign/sequence authoring experience for every listed business scenario.

### Consent, audiences and contact safety

WhatsApp reuses tenant CRM contacts, tags, fields and identity. Phone numbers are normalized for matching; WhatsApp inbound contact creation is serialized per tenant and normalized phone. Lead create/import/workflow paths deduplicate normalized tenant email/phone and fail closed on ambiguous matches instead of silently merging records. Click-to-WhatsApp referral identifiers are allowlisted and may be recorded on newly created leads when Meta supplies them; this is not conversion attribution.

Consent records capture scope/purpose, source, timestamp and evidence. CSV import previews/validates internationally formatted numbers, requires explicit consent fields, rejects normalized duplicates, and applies imports atomically; unknown consent is never upgraded to marketing opt-in. Runtime sends re-check purpose-specific eligibility, suppression and opt-out. Opt-out handling is applied to all-purpose suppression; re-consent is append-only and clearing a global opt-out requires explicit confirmation. Operators can page through global opt-outs and bulk toggle do-not-contact for up to 500 existing tenant contacts; restoring that contact flag does not erase consent history or clear a global opt-out. Language, timezone and messaging preferences do not themselves grant consent.

### Accounts, templates, media and Meta webhooks

The provider adapter is built for the official Meta WhatsApp Business Platform/Cloud API. Tenant-owned account/phone-number mapping, encrypted token storage and key rotation configuration, capability discovery, connection health, provider error normalization, outbound status handling and account-scoped template/media operations are implemented in the codebase. The UI/API must be configured with valid business assets and permissions; arbitrary personal WhatsApp accounts and unofficial WhatsApp Web automation are not supported.

Template operations include local draft create/edit/preview, supported header/body/footer/buttons, variable examples, submission, provider status refresh, approved/rejected status handling, supported provider-template import without overwriting local drafts, and append-only change snapshots. Sending requires an approved compatible template when a template is needed. The automation template packs currently accept approved BODY-only templates with ordered text parameters; provider formats unsupported by the editor are read-only, and authentication template authoring/comprehensive provider reconciliation are not implemented.

The message API/provider supports text, templates, interactive buttons/lists and the documented media allowlist; capabilities vary by account/API/provider and are checked rather than presumed. WhatsApp Flows and additional commerce message formats are not claimed. Meta webhook verification/signature checks, durable inbound event storage, idempotent processing, status synchronization, tenant-scoped failure listing and replay are implemented. Raw webhook payloads are not exposed in the customer event list. Meta template-status events are resolved to a unique tenant WABA; ambiguous legacy ownership is ignored.

### Shopify, billing, developer API and integrations

The Shopify adapter supports an OAuth connect/callback/disconnect lifecycle, encrypted expiring offline credentials, scope/status display, idempotent webhook setup, HMAC-verified webhook intake, durable idempotent privacy-minimized event processing, and a restricted order-status workflow action. Order lookup is allowed only from an inbound WhatsApp trigger, requires `read_orders`, and verifies the requester's sender phone against available order/customer/shipping phone data before exposing status/tracking. Subsequent sends in that execution stay bound to the verified sender. Missing/unavailable protected fields fail closed. Checkout payloads exclude checkout token, recovery URL, email and phone. The Shopify cart-recovery product remains unavailable; WooCommerce, catalog, inventory, checkout recovery and broad refund/return operations are not implemented.

The platform Stripe integration governs product checkout, subscription/plan entitlements and platform billing. Signed billing events use a transactional outbox and can trigger supported workflow lifecycle events. This is not a customer-payment adapter: customer Stripe/Razorpay invoice/payment events and native WhatsApp payments are not claimed. No message cost or revenue attribution is invented.

Developer access includes scoped tenant API-key authentication, hashed key lookup, one-time key reveal, per-key/global rate limits, request validation, persisted idempotency where supported, signed queued outbound webhooks, tenant-scoped delivery logs/replay with fresh attempt identities, stable event IDs and minimized CRM, WhatsApp, workflow, Shopify and billing payloads. API keys and provider tokens are never returned in list/status responses. Generic REST/webhook actions reuse the workflow engine; Zapier, Make, Google Sheets/Calendar, Calendly and other integrations are not live adapters unless separately implemented and configured.

### Analytics and measured outcomes

`/whatsapp/analytics` uses stored provider/message and application records for date-filtered message-state counts, campaign aggregates, workflow execution summaries, CSAT timestamps and SQL-based response/SLA metrics. The API supports UTC `from` inclusive and `to` exclusive bounds; recent campaign/automation rows are capped. Campaigns link to detail pages and automation rows expose stored execution state/timing. Delivered/read status depends on provider callbacks and account capabilities. Conversion, order recovery, attributed revenue, AI cost and Meta/provider messaging cost are not inferred when the source event or authoritative cost is absent.

### API entry points

All API routes use the `/api/v1` prefix. Exact DTOs, permission requirements, request/response envelopes and limits are documented in the [WhatsApp implementation checkpoint](docs/whatsapp-automation-implementation.md) and generated OpenAPI contract at runtime (for local development, [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)). Principal surfaces include:

- `/whatsapp-automations/catalog`, `/catalog/:slug`, `/preview`, `/install`, `/checkout`, `/installed`, and per-installation config/activate/disable/run/execution history.
- `/whatsapp/accounts/*` for connect/disconnect, status/capabilities, template/media operations and account resources.
- `/whatsapp/conversations/*`, `/whatsapp/inbox/*`, `/whatsapp/send-content`, `/whatsapp/messages/*/media/*`, `/whatsapp/webhook-events/*`.
- `/whatsapp/broadcasts/*` including scheduling, campaign approval and recipient export; `/whatsapp/templates/*`; `/whatsapp/consent/*`; `/whatsapp/analytics`.
- `/workflows/*` for definition/preview/publish/versioning/executions and `/integrations/shopify/*` for Shopify OAuth/status/webhook lifecycle.
- `/developer/*` for API key and signed webhook delivery management.

Most workspace endpoints require Bearer authentication, tenant context, relevant permission/plan entitlement and tenant-owned resource checks. The Meta webhook endpoint uses provider signature/verification rather than customer bearer authentication; Shopify webhooks use Shopify HMAC. Public catalog/product discovery is read-only. Preview is dry-run only and does not send messages, invoke AI generation, mutate CRM, or charge payment methods.

### Configuration checklist

Use `backend/.env.example` as the source of variable names; never commit real credentials.

1. Configure the public API/frontend URLs, PostgreSQL, Redis and application/JWT secrets.
2. Configure Meta app/webhook verification values, tenant account authorization and token encryption/rotation (`WHATSAPP_*` variables); complete the required Meta Business setup and webhook subscriptions.
3. Configure Stripe platform keys and price identifiers only if paid automations/platform billing are enabled. Provider message charges, AI usage and external fees are separate from the platform automation price.
4. For Shopify, configure `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_CALLBACK_URL`, public HTTPS `SHOPIFY_WEBHOOK_URL`, granted scopes and a 32-byte `SHOPIFY_TOKEN_ENCRYPTION_KEY` or keyring. Live callbacks require routable HTTPS.
5. Configure AI provider credentials and indexed tenant knowledge before enabling the AI knowledge assistant.
6. Apply checked-in migrations using the deployment's normal migration process; do not rely on TypeORM schema synchronization in production.
7. Verify health, queue processing, signature validation, tenant access, account capability discovery, and consent/approved-template behavior in a non-production account before sending real messages.

### Explicitly not claimed as complete

The repository does not claim every automation idea in the original master catalog is a finished feature. In particular, live Meta/Shopify/Stripe/AI operation has not been established by source presence alone; specialist AI agents for booking, orders, returns, multilingual media, etc.; full human-agent collaboration/merge/skills analytics; campaign budgets/A-B/conversion attribution; broad e-commerce adapters/recovery/inventory; calendar/payment-provider integrations; all industry packs; WhatsApp Flows; and every developer/marketplace connector are absent, partial or externally dependent as detailed in the [coverage matrix](docs/whatsapp-automation-implementation.md). No production rollout, live customer message or customer charge is asserted by this README.

## API, queues, caching and storage

Controller groups include `auth`, `crm`, `ai`, `voice`, `whatsapp`, `workflows`, `billing`, `analytics`, `marketplace`, `developer`, `admin`, `search`, `storage`, `import`, `export`, `backup`, `notifications`, and `health`. Use `/openapi.json` for the exact method-level contract.

Redis supports cache/throttling and the following Bull queues: `email`, `sms`, `whatsapp`, `voice`, `notification`, `ai-inference`, `workflow`, `billing`, `analytics`, `import`, `export`, and `search-index`. MinIO is the S3-compatible object store. Qdrant is configured for vector/RAG use.

## Docker and deployment

`docker-compose.yml` starts PostgreSQL, Redis, MinIO, Qdrant, API, UI, and Adminer. `docker-compose.prod.yml` adds nginx, certificate bootstrap/renewal plumbing and uses published images. It is a production-shaped baseline, not proof of a finished production environment.

The `prod` GitHub Actions workflow builds/pushes GHCR images, uses Terraform to manage AWS infrastructure, uploads deploy artifacts to S3, and sends an SSM deployment command that migrates and recreates the Compose stack. It requires AWS credentials, GitHub package permissions, S3, SSM, runtime secrets, DNS, and TLS setup.

### Connecting to the production instance

SSH is disabled by design (`main.tf`'s `allowed_ssh_cidr` defaults to `""`, which skips the port-22 security group rule entirely — see the comment "Empty disables SSH ingress (SSM preferred)"). All remote access goes through AWS Systems Manager instead, using the same IAM credentials the deploy pipeline already has.

**Interactive shell** (requires the [Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html) for the AWS CLI, or use the AWS Console's Session Manager tab with no local setup at all):

```bash
aws ssm start-session --target <instance-id> --region ap-south-1
```

**One-off command without an interactive session** (what the deploy pipeline itself uses to check container status/logs):

```bash
COMMAND_ID=$(aws ssm send-command \
  --instance-ids <instance-id> \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cd /home/ubuntu/app && sudo docker compose -f docker-compose.prod.yml logs --tail=200 api"]' \
  --region ap-south-1 \
  --query 'Command.CommandId' --output text)

aws ssm get-command-invocation \
  --command-id "$COMMAND_ID" \
  --instance-id <instance-id> \
  --region ap-south-1 \
  --query 'StandardOutputContent' --output text
```

Find the current `<instance-id>` with `aws ec2 describe-instances --filters "Name=tag:Name,Values=*autopilot*" --query 'Reservations[].Instances[].InstanceId' --region ap-south-1`, or read it from the most recent deploy run's Terraform output.

If you genuinely need SSH (e.g. an interactive debugger that doesn't work over SSM), set the `allowed_ssh_cidr` Terraform variable to your IP as a `/32` CIDR and re-apply — this opens port 22 to that address only. Treat this as a deliberate, temporary security-posture change, not a default way of working.

## Security, monitoring and troubleshooting

The API initializes Helmet, compression, production CORS validation, Sentry (when configured), correlation IDs, Winston logging, exception filters, rate limits, health endpoints and audit/error/security records. There is no managed alerting, external log sink, verified restore drill, or separate worker deployment checked in.

| Symptom | Check |
|---|---|
| API does not boot | Backend env contract, DB/Redis reachability, production HTTPS URLs and JWT keys |
| Checkout fails | Stripe secret/webhook and non-placeholder `STRIPE_PRICE_*` values |
| WhatsApp/voice fails | Meta/Twilio tenant/provider credentials, webhook/public URL and queue health |
| RAG fails | OpenAI API key, Qdrant/MinIO availability, source content |
| Asynchronous work stalls | Redis connection and the API process, which hosts consumers |

## Documentation

- [High-Level Design](docs/HLD.md)
- [Low-Level Design](docs/LLD.md)
- [Feature Catalog](docs/FEATURE_CATALOG.md)

## License

Proprietary — all rights reserved unless the repository owner states otherwise.
