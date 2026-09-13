# Autopilots Monster CRM

Autopilot Monster CRM is a multi-tenant, AI-oriented CRM and communications platform. The repository contains a Next.js UI, a NestJS API, PostgreSQL schema/migrations, Redis/Bull job processing, MinIO storage, Qdrant configuration, Docker Compose, Terraform, nginx, and GitHub Actions.

This README describes the checked-in implementation as of 2026-09-12. It does not imply that third-party services are configured or production-ready.

## Product vision

The product combines CRM data, tenant-aware access controls, subscriptions, automated workflows, AI assistance, voice, WhatsApp, analytics, and platform administration so organizations can operate sales and customer workflows from one system.

## Current project status

Implementation evidence is strong across API, UI, data, and infrastructure artifacts, but live provider validation and operating runbooks remain deployment work.

| Area | Estimate | Evidence |
|---|---:|---|
| Overall | 82% | 337 UI pages, 122 controller files, 80 entity classes, 15 migrations and 12 queues |
| Frontend / backend | 84% / 86% | App Router UI, Nest modules, controllers, services, DTOs and guards |
| CRM / auth / workflow | 88% / 84% / 82% | End-to-end entity, API and UI footprints |
| AI / voice / WhatsApp / billing | 76% / 74% / 78% / 76% | Application paths implemented; providers must be configured |
| Infrastructure / production readiness | 74% / 63% | Compose, nginx, Terraform and CI exist; TLS, secrets, provider cutovers, DR and scale validation remain operational concerns |

These are implementation-evidence estimates, not acceptance-test results or a go-live approval. See [HLD](docs/HLD.md), [LLD](docs/LLD.md), and the [feature catalog](docs/FEATURE_CATALOG.md) for the basis.

### Recent fixes (this branch)

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
| WhatsApp | Messages, templates, inbox, broadcast, webhook, queue processor | Meta account/token/webhook required |
| Workflow | Flows, executions, action executor, events, processor and builder routes | Workers run in the API process |
| Billing | Plans, limits, subscriptions, invoices, payments, wallet, usage, coupons | Valid Stripe configuration required for payments |
| Analytics | Dashboards, reports, analytics event listener and queue | Depends on emitted domain events |
| Marketplace/developer | Plugins, templates, OAuth apps, webhooks, API logs | No sandboxed plugin runtime is present |
| Admin/platform | Tenant/user/RBAC/security/configuration/queue/log/system administration | Restricted by API RBAC |

The full feature-by-feature status, dependencies, and limitations are in [docs/FEATURE_CATALOG.md](docs/FEATURE_CATALOG.md).

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
