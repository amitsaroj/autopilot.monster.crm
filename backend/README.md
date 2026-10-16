# Backend API

This directory contains the NestJS API for Autopilot Monster CRM. It is a modular monolith: domain modules are composed by the application module, and Bull queue processors run in the API process. It is not a separately deployed microservice or worker fleet.

For the system context see [high-level design](../docs/HLD.md), implementation conventions [low-level design](../docs/LLD.md), current recorded checks [implementation status](../docs/implementation-status.md), and the overall [root README](../README.md). The generated OpenAPI JSON is available from a running local API at `http://localhost:8000/openapi.json`; Swagger UI is environment-dependent.

## Main modules

- **Auth/tenant/RBAC:** local identity, session/token flows, MFA/OAuth paths, tenant membership, roles, permissions, API keys and settings.
- **CRM:** contacts, companies, leads, deals/pipelines, activities, tasks, notes, products, quotes, segments, tags, imports/exports and related automation events.
- **Billing/monetization:** plans, feature/limit checks, subscriptions, invoices, payments, coupons, usage and Stripe integration paths.
- **AI:** agents, conversations, prompts, knowledge bases/RAG, inference and fine-tuning job records; provider operations require configuration.
- **Voice/WhatsApp:** provider adapters, callbacks/webhooks, messaging/campaign or call queues, consent and status processing; live behavior requires external accounts.
- **Workflow:** shared definitions, validation, triggers, action execution, durable execution records, waits/retries and queue processing.
- **Platform:** analytics, search, developer webhooks/OAuth, marketplace/plugin metadata, notifications, storage, data jobs, support, admin and health.

Module presence is not proof of every endpoint or provider flow being operational. Check route DTOs, guards, services, migrations and the module-specific documentation for exact behavior.

## Local development

Prerequisites and service setup are maintained in the [root README](../README.md#local-development). Use this package's installed dependency lock and scripts:

```bash
npm ci
npm run dev
```

When running services directly on the host, supply environment variables using a local ignored `.env` or secure environment injection. `env.config.ts` reads `process.env` at module import; a plain `.env` file is not automatically loaded by the application in every command. Do not source untrusted env files. For example, in a private local development environment only:

```bash
set -a
source .env
set +a
npm run dev
```

Use the repository's migration script after provisioning the database and when new migrations are introduced. Seed only disposable development databases; seed scripts create demo data and credentials. Never run development seed commands against production.

## Package scripts

```bash
npm run build
npm run typecheck
npm run lint:check
npm test -- --runInBand
npm run test:integration
npm run migration:run
npm run seed:dev
```

Use the script names currently declared in `package.json`; CI/release policy may require a different command or order. Record test failures accurately. A passing typecheck/build does not replace tests, migration review, provider validation or security checks.

## Configuration and security

Use [`backend/.env.example`](.env.example) only as the variable-name reference. It includes configuration groups for API URLs/ports, PostgreSQL, Redis, JWT, storage, Qdrant/OpenAI, SMTP, Stripe, WhatsApp, Shopify, OAuth and observability. Which variables are mandatory depends on enabled features and deployment configuration; the old claim that one fixed list is universally required was incorrect.

Do not commit `.env`, production secret files, provider tokens, private keys, encryption keys or customer data. Production secrets must be injected from the approved secret manager. Configure migrations with schema synchronization disabled. Read [security design](../docs/security.md) and [operations runbooks](../docs/operations-runbooks.md) before exposing the API.
