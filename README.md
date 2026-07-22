# Autopilot Monster CRM

Autopilot Monster CRM is a multi-tenant, AI-first CRM and communications platform. It combines NestJS APIs, a Next.js App Router UI, PostgreSQL, Redis/Bull queues, MinIO object storage, and optional Qdrant/OpenAI services in one monorepo.

## Project Overview

Purpose: operate sales CRM, billing, automation, AI assistants, WhatsApp, and voice outreach for multiple tenants from one control plane.

Business value: unify pipeline management, monetization, omnichannel messaging, and AI workflows under tenant-isolated RBAC with auditability.

**Current status (2026-07-22):** engineering completion **~86%**. Critical/High implementation backlog is **empty**. Production go-live is **Conditional** on ops runbooks (secrets, Stripe, TLS) in `docs/OPS_RUNBOOKS.md`. See `docs/FINAL_COMPLETION_REPORT.md`.

## Architecture

```text
Clients (Web)
   │
   ▼
nginx (HTTP/HTTPS) ──► Next.js UI
   │
   └── /api/v1/* ──► NestJS API
                        ├── TypeORM → PostgreSQL
                        ├── Bull → Redis (workflow, voice, email, search-index, …)
                        ├── MinIO (files / backups)
                        ├── Qdrant (RAG vectors)
                        ├── Stripe / Twilio / Meta / OpenAI
                        └── Audit log + analytics emitters
```

Runtime topology for production-like deploys: single EC2 host running `docker-compose.prod.yml` (API, UI, Postgres, Redis, MinIO, Qdrant, nginx, certbot path). Terraform provisions the host, security group, SSM role, and Elastic IP. Queue processors run **in-process** with the API.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Zustand |
| Backend | NestJS 11, TypeORM, class-validator, Swagger |
| Data | PostgreSQL, Redis |
| Queues | Bull (`@nestjs/bull`) |
| Storage / AI | MinIO, Qdrant, OpenAI |
| Comms | Meta WhatsApp Cloud API, Twilio Voice |
| Billing | Stripe (env-driven price IDs) |
| Infra | Docker Compose, nginx, Terraform (AWS EC2) |
| CI/CD | GitHub Actions (`ci.yml`, `deploy.yml`) |

## Folder Structure

```text
autopilot.monster.crm/
├── backend/                 # NestJS API, migrations, queue processors
├── frontend/                # Next.js App Router UI (~337 pages)
├── docs/                    # Authoritative product docs (ONLY place for new markdown)
│   ├── FEATURE_INVENTORY.md
│   ├── COMPLETION_SCORECARD.md
│   ├── MASTER_PRODUCT_BACKLOG.md
│   ├── ENTERPRISE_BASELINE.md
│   ├── IMPLEMENTATION_STATUS.md
│   ├── OPS_RUNBOOKS.md
│   └── FINAL_COMPLETION_REPORT.md
├── Docs/audit/              # Historical audit evidence (may be stale)
├── nginx/                   # Ingress + TLS mount points
├── docker-compose.yml       # Local stack
├── docker-compose.prod.yml  # Production-shaped stack
├── main.tf / provider.tf / variables.tf / outputs.tf
└── README.md                # This file
```

## Installation

```bash
git clone <repo-url>
cd autopilot.monster.crm
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d
cd backend && npm ci && npm run migration:run && npm run seed
cd ../frontend && npm ci
```

## Environment Variables

Use examples only in git:

- Root: `.env.example`
- Backend: `backend/.env.example`, `backend/.env.production.example`
- Frontend: `frontend/.env.example`, `frontend/.env.production.example`

Critical production keys (secret manager, not git):

- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` / `JWT_KEY_ID` (RS256)
- `DATABASE_URL`, Redis, MinIO, Qdrant URLs
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`
- `TWILIO_*`, WhatsApp/Meta tokens, `OPENAI_API_KEY`
- Optional: `ELEVENLABS_API_KEY` for voice cloning

## Docker Setup

Local:

```bash
docker compose up -d --build
curl -sf http://localhost:8000/api/v1/health/ready
```

Production-shaped:

```bash
docker compose -f docker-compose.prod.yml up -d
curl -k -sf https://localhost/api/v1/health/ready
```

## Development Guide

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

Swagger: `http://localhost:8000/api/docs` (disabled in production).

## Deployment Guide

1. Provision host with Terraform (`terraform init -backend-config=...`, `plan`, `apply`).
2. Point DNS to Elastic IP output.
3. Inject secrets via SSM/CI; never commit production env files.
4. Deploy images via `.github/workflows/deploy.yml` (env contract checks, terraform gate, SSM wait, health poll).
5. Complete TLS + Stripe + provider cutovers using `docs/OPS_RUNBOOKS.md`.

## Authentication / Authorization / Multi-tenancy

- JWT access tokens (RS256 in production) + refresh flow
- MFA at login and enrollment in settings
- OAuth providers (Google/Facebook/GitHub/Apple) when env configured
- Global JWT + tenant guards; RBAC resource permissions and roles
- Tenant-scoped repositories and settings overrides

## Modules

| Module | Purpose | Status |
|---|---|---|
| Auth | Login, refresh, MFA, OAuth | Ready |
| Tenant / Teams / Users | Org structure | Ready |
| RBAC | Roles, permissions | Ready |
| CRM | Contacts, companies, leads, deals, pipelines, tasks, products, quotes, duplicates | Ready |
| Billing | Plans, checkout, invoices, wallet, usage | Ready (Stripe ops cutover) |
| WhatsApp | Inbox, templates, broadcast, flows | Ready (Meta ops cutover) |
| Voice | Outbound/inbound, campaigns, STT/TTS/sentiment | Ready (Twilio/OpenAI ops) |
| AI | Agents, prompts, KB, RAG (file + URL), fine-tuning | Ready |
| Workflow | Triggers, actions, retries | Ready |
| Analytics | Overview, pipeline, revenue, PDF export | Ready |
| Marketplace | Plugins + templates | Ready |
| Developer | Webhooks, OAuth apps, API logs | Ready |
| Admin / Super Admin | Settings, queues, security, metrics | Ready |
| Search | Global search + index queue | Ready |
| Infra | Compose, nginx, Terraform, CI/CD | Ready (TLS ops) |

## Feature List (product)

Contacts, companies, leads, deals, pipelines, activities, tasks, products, quotes, forecasting, duplicate merge, billing plans/subscriptions/wallet/usage, WhatsApp inbox/broadcast/templates/flows, voice campaigns + AI speech pipeline, AI agents/KB/RAG/prompts, workflow automation, analytics dashboards/exports, marketplace templates, developer webhooks/OAuth, audit logs, feature flags, import/export/backup/storage/notifications, admin and super-admin consoles.

## API Overview

- Base path: `/api/v1`
- Auth: `Authorization: Bearer <accessToken>` + `x-tenant-id`
- Domains: `/auth`, `/crm`, `/billing`, `/whatsapp`, `/voice`, `/ai`, `/workflows`, `/analytics`, `/marketplace`, `/developer`, `/admin`, `/search`, `/health`, `/notifications`, `/import`, `/export`, `/backup`, `/storage`

## Database Overview

- PostgreSQL via TypeORM entities under `backend/src/database/entities` (78 entities)
- Migrations under `backend/src/database/migrations` (10)
- Soft-delete and tenant columns used across CRM/platform tables

## Infrastructure / Queues / Caching / Storage

- Redis + Bull queues: workflow, voice, email, sms, notification, ai-inference, billing, analytics, search-index, whatsapp, import/export
- Storage: MinIO via `StorageService`
- Vectors: Qdrant for RAG embeddings

## Known Integrations

Stripe, Twilio, Meta WhatsApp, OpenAI, optional ElevenLabs, SMTP/SMS via admin settings, GitHub Actions + AWS SSM deploy path. PayPal/Razorpay are explicitly unavailable stubs (not launch scope).

## Scripts

```bash
cd backend && npm run format && npm run build
cd frontend && npm run build
cd backend && npm run migration:run && npm run seed
```

## Troubleshooting

| Symptom | Check |
|---|---|
| API won’t boot in production | RS256 keys + `JWT_KEY_ID`, HTTPS URLs, DB connectivity |
| Checkout 400 | `STRIPE_PRICE_*` env values / seed sync |
| WhatsApp send fails | Tenant WABA credentials completeness |
| Voice AI 503 | `OPENAI_API_KEY` / tenant `openai_key` |
| Voice clone 503 | `ELEVENLABS_API_KEY` |
| Search stale | Redis + search-index queue processor |
| RAG crawl fails | Reachable URL + OpenAI + Qdrant |

## Contribution Guide

1. Work from a feature branch.
2. Keep new markdown under `docs/` (except root `README.md`).
3. Do not commit secrets.
4. Run format + build before PR.
5. Prefer extending existing modules over parallel implementations.
6. Never ship fake-success stubs; fail honestly or implement for real.

## License

Proprietary — all rights reserved unless otherwise stated by the repository owner.

## Authoritative Product Docs

- Inventory: [`docs/FEATURE_INVENTORY.md`](docs/FEATURE_INVENTORY.md)
- Scorecard: [`docs/COMPLETION_SCORECARD.md`](docs/COMPLETION_SCORECARD.md)
- Backlog: [`docs/MASTER_PRODUCT_BACKLOG.md`](docs/MASTER_PRODUCT_BACKLOG.md)
- Implementation status: [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)
- Enterprise baseline: [`docs/ENTERPRISE_BASELINE.md`](docs/ENTERPRISE_BASELINE.md)
- Ops runbooks: [`docs/OPS_RUNBOOKS.md`](docs/OPS_RUNBOOKS.md)
- Final report: [`docs/FINAL_COMPLETION_REPORT.md`](docs/FINAL_COMPLETION_REPORT.md)
- Historical audits: `Docs/audit/` (may be stale)
