# High Level Design (HLD)

Last updated: 2026-09-08

This document is reverse-engineered from the repository content. It describes the current implementation of Autopilot Monster CRM and reflects only implemented artifacts (no assumptions).

## 1. Executive Summary

Autopilot Monster CRM is a multi-tenant AI-native revenue platform combining a Next.js marketing + product UI and a NestJS backend API. The system integrates PostgreSQL (TypeORM), Redis + Bull queues, MinIO object storage, and optional vector DB (Qdrant) to support AI Agents, voice calling, WhatsApp, workflow automation and billing. The repository contains production-shaped Docker Compose manifests and Terraform snippets to provision a single-host deployment.

## 2. Product Overview

- Multi-tenant CRM: contacts, companies, leads, deals, pipelines
- AI: agents, prompts, fine-tuning, knowledge-base and RAG
- Voice: outbound/inbound campaigns, STT/TTS integrations
- WhatsApp: team inbox, templates, broadcast, flow builder
- Workflow engine: triggers, conditions, actions
- Billing: Stripe-driven pricing, subscriptions and wallet
- Marketplace: plugins and templates

## 3. Business Objectives

- Reduce manual sales work with autonomous agents and voice outreach
- Provide a single platform for CRM, messaging, voice and automation
- Offer programmatic integration surface (APIs, webhooks, SDKs)

## 4. System Overview

- Clients: modern browsers (Next.js), programmatic agents (OpenAPI, MCP), mobile (not in repo)
- Ingress: `nginx` configuration in `nginx/`
- Frontend: `frontend/` Next.js App Router (server+client components)
- Backend: `backend/` NestJS (modular, many feature modules)
- Data: PostgreSQL (TypeORM entities under `backend/src/database/entities`)
- Queues: Redis + Bull via Nest modules (`backend/src/queue`)
- Storage: MinIO
- Optional: Qdrant for vector search

## 5. High-Level Architecture Diagram

```mermaid
flowchart LR
  Browser[Browser / Agents]
  Browser -->|HTTPS| Nginx[/nginx/ reverse proxy]
  Nginx --> Frontend[Next.js frontend]
  Nginx --> Backend[NestJS API /api/v1]
  Backend --> Postgres[(PostgreSQL)]
  Backend --> Redis[(Redis + Bull queues)]
  Backend --> MinIO[(MinIO object storage)]
  Backend --> Qdrant[(Qdrant) - optional]
  Backend -->|Third-party| Stripe(Stripe)
  Backend -->|Third-party| Twilio(Twilio)
  Backend -->|Third-party| MetaWhatsApp(Meta WhatsApp)
  Backend -->|Third-party| OpenAI(OpenAI)
```

## 6. Technology Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, Vitest
- Backend: NestJS 11, TypeScript, TypeORM, class-validator, Swagger
- Datastore: PostgreSQL
- Queues: Redis + Bull
- Storage: MinIO
- Vector DB: Qdrant (optional)
- CI/CD: GitHub Actions (workflow files present in repo root)
- Infra: Docker Compose + Terraform (main.tf, provider.tf present)

## 7. Deployment Architecture

- Production-shaped `docker-compose.prod.yml` and an nginx/SSL setup are provided. Terraform files (`main.tf`, `provider.tf`, `outputs.tf`, `variables.tf`) provision infrastructure (EC2 host + networking) to host the compose stack.

## 8. Multi-Tenant Architecture

- Repository contains tenant-aware constructs: `x-tenant-id` headers, tenant guards, tenant-scoped services, tenant entities.
- Tenancy enforced via `TenantGuard` and tenant-specific repository patterns in the backend.

## 9. Authentication Flow

- JWT (RS256 in production) with refresh tokens is implemented.
- OAuth providers: Google, Facebook, GitHub, Apple (env-configured).
- MFA flow exists in frontend (`/mfa`) and backend `auth` module.

## 10. Authorization Flow

- Role-based access control (RBAC) implemented via `RolesGuard`, `PermissionGuard` and decorators in `backend/src/common/guards` and `backend/src/common/decorators`.

## 11. System Modules (High level)

- Auth, Tenant, CRM, Billing, WhatsApp, Voice, AI, Workflow, Analytics, Marketplace, Developer, Admin, SuperAdmin, Notifications, Storage, Scheduler, Search.
- Each module is implemented as a NestJS module under `backend/src/modules` (e.g., `backend/src/modules/crm`, `backend/src/modules/ai`).

## 12. Module Dependencies

- Modules depend on shared utilities and common interceptors/guards. `DeveloperModule` exposes OAuth app management.

## 13. External Integrations

- Stripe, Twilio, Meta WhatsApp Cloud API, OpenAI, optional ElevenLabs for voice.

## 14. Infrastructure Overview

- Docker Compose for local/prod stacks, nginx for TLS/ingress, Terraform for host provisioning.

## 15. API Communication Flow

- Base path: `/api/v1` (set by `app.setGlobalPrefix('api/v1')` in `backend/src/main.ts`).

## 16. Queue Architecture

- Redis/Bull queues used for workflow execution, voice campaign processing, email delivery, search indexing, and other background tasks. Processors live in `backend/src/queue/processors` and modules register processors.

## 17. Event-Driven Architecture

- Internal event bus exists (`backend/src/events/event-bus.module.ts`) for decoupled interactions and telemetry.

## 18. Data Flow

- Requests flow from frontend to API, API enqueues long-running jobs into Redis queues and persists records in PostgreSQL; background workers process tasks and emit events/notifications.

## 19. High-Level Database Design

- TypeORM entities under `backend/src/database/entities` (many domain entities like `contact`, `lead`, `deal`, `user`, `tenant`, `oauth-app`, `subscription`).

## 20. Security Architecture

- Helmet and compression used; RBAC, tenant isolation, JWT, API keys, and CORS configured. Secrets expected to be injected via environment and secret manager.

## 21. Scalability Strategy

- Designed for horizontal scale: queues decouple work; storage and DB scale independently; future cluster-based deployment achievable by moving services off single-host compose.

## 22. Performance Strategy

- Caching via Redis; offload heavy work to queues; use of Qdrant for vector queries.

## 23. Logging Strategy

- Centralized logger module present (`backend/src/logger`) with Sentry integrated in `backend/src/main.ts`.

## 24. Monitoring Strategy

- Health endpoints exist (`/api/v1/health`) and status pages in frontend; CI/health checks referenced in deploy docs.

## 25. Error Handling Strategy

- Global exception filters (`HttpExceptionFilter`, `AllExceptionsFilter`) return a standard JSON envelope `IApiResponse`.

## 26. Backup & Disaster Recovery

- MinIO for object storage; DB migrations and seeds provided. Ops runbooks detail backup strategies (`docs/OPS_RUNBOOKS.md`).

## 27. Production Deployment Flow

- Terraform to provision host → upload env/secret → docker compose -f docker-compose.prod.yml up -d → health checks.

## 28. Current Project Status

- Repository demonstrates a largely complete platform with many modules implemented. Unit tests in backend/frontend run locally. Some integration points are environment-dependent (Stripe, Twilio, OpenAI, Qdrant).

## 29. Known Limitations

- Some external integrations require operational credentials and should be configured before production. MCP and llms publishing were added in the frontend in this branch.

## 30. Future Enhancements

- Clustered deployment manifests (Kubernetes), managed OpenSearch replacement, hardened MCP streaming endpoint, more formal API versioning strategy.

---

References: repository files and modules (2026-09-08 snapshot).
