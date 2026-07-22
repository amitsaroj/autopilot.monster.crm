# Autopilot Monster CRM

Autopilot Monster CRM is a multi-tenant AI-first CRM platform implemented as a NestJS backend and Next.js frontend in a single repository.

## Repository Layout

```bash
autopilot.monster.crm/
├── backend/      # NestJS API, queues, modules, migrations
├── frontend/     # Next.js app router UI
├── docs/         # Authoritative product backlog and implementation status
├── Docs/audit/   # Historical deep audit artifacts and matrices
├── docker-compose.yml
└── docker-compose.prod.yml
```

## Core Architecture

- Backend: NestJS + TypeORM + PostgreSQL + Redis + queue processors.
- Frontend: Next.js + TypeScript + Zustand and API service layer.
- Storage and AI support: MinIO + Qdrant + OpenAI integration surfaces.
- Communication stack: WhatsApp and Twilio voice modules.
- Runtime topology: Docker Compose for local and production-like environments.

## Domain Module Status

| Domain | Status | Notes |
|---|---|---|
| Auth + Tenant + RBAC | Partial | Core flows implemented; RS256 startup/rotation guardrails enforced, ops rotation still pending |
| CRM Core (contacts/leads/companies/deals/pipelines) | Partial | Major APIs and pages implemented; server pagination rollout remains |
| Billing + Wallet + Monetization | Partial | Stripe integration active with failed-payment retry recovery; production Stripe ops verification pending |
| AI + RAG + Prompts | Partial | Core endpoints and UI exist; advanced depth remains |
| Workflow + Queues | Partial | Processors active; search-index and consistency cleanup remain |
| Analytics + Reporting | Partial | Core reports active; advanced custom report depth pending |
| WhatsApp + Voice + Omnichannel | Partial | Functional foundations shipped; provider runtime hardening pending |
| Marketplace + Developer APIs | Partial | Modules mounted and wired; UX/depth consistency items remain |
| Infrastructure + CI/CD | Partial | Deploy pipeline now has env contract checks + wait/health gates; TLS/secrets ops items remain |

## Authoritative Product Documentation

- Backlog: `docs/MASTER_PRODUCT_BACKLOG.md`
- Implementation status: `docs/IMPLEMENTATION_STATUS.md`
- Audit evidence and prior matrices: `Docs/audit/`

## Build and Formatting Commands

Run from repository root:

```bash
cd backend && npm run format
cd backend && npm run build
cd frontend && npm run build
```

## Production Readiness

Current status: **Not Production Ready**.

Primary open gates:
- Complete secret rotation and environment hardening.
- Finalize TLS cutover and provider credential operations.
- Complete production Stripe key/price provisioning and webhook live verification.
- Close remaining omnichannel provider credential hardening and Terraform architecture parity.
