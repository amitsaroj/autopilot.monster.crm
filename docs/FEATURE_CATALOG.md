# Feature Catalog

**Repository snapshot:** 2026-09-09. Status reflects code evidence, not vendor-account readiness. “Partial” means implementation requires an external provider/configuration or lacks an isolation/operations boundary in this repository.

| Feature | Module | Description and business purpose | Status | Dependencies |
|---|---|---|---|---|
| Tenant workspaces and teams | Tenant | Tenant, team, invitation, API-key and feature-flag controllers/services manage workspace context. Lets one platform serve independent organizations. | Implemented | PostgreSQL, tenant guards |
| Identity and sessions | Auth | Local registration/login, refresh, password/email flows and MFA endpoints/UX are present. Establishes secure user access. | Implemented | JWT, email configuration |
| Social sign-in | Auth | Google, Facebook, GitHub and Apple strategy/configuration paths exist. Reduces onboarding friction when configured. | Partial | Provider credentials/callback URLs |
| RBAC and plan limits | RBAC/common | Global roles, permissions, resource permissions, feature, plan and limit decorators/guards protect API resources. Enables least-privilege and subscription enforcement. | Implemented | JWT, tenant context, plans/permissions |
| Contacts and companies | CRM | CRUD-oriented CRM services/controllers/UI manage people and organizations with relationships and activity context. Central customer record system. | Implemented | PostgreSQL, tenant context |
| Leads, conversion and scoring | CRM | Lead records, lead conversion and scoring services plus UI routes are present. Supports qualification and sales handoff. | Implemented | CRM entities/events |
| Deals and pipelines | CRM | Deal, history, pipeline/stage, forecast and lifecycle code support sales opportunities. Supports pipeline management and revenue visibility. | Implemented | PostgreSQL, CRM permissions |
| Tasks, activities, notes and tags | CRM | Task/activity/note/tag/segment/custom-field entities and UI routes capture follow-up and customer context. Supports daily sales execution. | Implemented | PostgreSQL |
| Products, quotes and deal products | CRM | Product catalogue, quote lifecycle, deal-product linkage and public quote route are implemented. Supports commercial proposals. | Implemented | PostgreSQL |
| Duplicate and omnichannel tools | CRM | Duplicate controller/service and omnichannel controller/service exist. Helps avoid duplicate records and consolidate communications. | Implemented | CRM records |
| Global search | Search | Search controller, listener and search-index queue processor update/query indexed CRM data. Improves record discovery. | Implemented | Redis/Bull, PostgreSQL |
| Plans, subscriptions and usage | Billing | Plans/features/limits, subscriptions, invoices, payments, methods, wallet and usage entities/services/UI are present. Monetizes tenant access. | Implemented | PostgreSQL, Stripe for payment paths |
| Stripe checkout/webhooks | Billing | Stripe service and production price-key configuration validation are present. Accepts subscription payments when configured. | Partial | Valid Stripe keys/prices/webhook secret |
| Coupons and pricing administration | Billing/admin | Coupon and pricing settings controllers plus plan/admin routes are present. Supports promotions and plan administration. | Implemented | PostgreSQL, Stripe as applicable |
| AI agents and conversations | AI | Agent, conversation and AI prompt resources have controllers/services/UI. Provides configurable AI-assisted interactions. | Partial | OpenAI credentials |
| Prompt library | AI | Prompt-template and AI-prompt entities/controllers/services and UI manage reusable prompts. Supports consistent AI behavior. | Implemented | PostgreSQL |
| Knowledge base and RAG | AI | Knowledge-base upload/URL service, RAG service and vector configuration are present. Supports grounded answers over tenant knowledge. | Partial | MinIO, OpenAI, Qdrant |
| Fine-tuning jobs | AI | Fine-tuning DTOs, entity, controller/service and UI page exist. Tracks model-training job requests. | Partial | OpenAI/provider readiness |
| Voice calling and campaigns | Voice | Calls, phone numbers, campaigns, queue processor, transcript/sentiment paths and Twilio callback controller are present. Supports automated voice outreach. | Partial | Twilio, OpenAI/optional ElevenLabs, Redis |
| WhatsApp inbox/templates/broadcasts | WhatsApp | Template, message, conversation, broadcast, webhook and queue processor code plus UI routes are present. Supports WhatsApp customer communication. | Partial | Meta WhatsApp account/token/webhook, Redis |
| Workflow automation | Workflow | Flow/execution entities, templates, executor/action executor, event listener, processor, retries and builder pages are present. Automates reactions to domain events. | Implemented | EventEmitter, Redis/Bull, domain services |
| Notifications | Notifications | Notification service/controller and Socket.IO gateway provide delivery and real-time notification paths. Keeps users informed. | Implemented | PostgreSQL; external channels as configured |
| Email and SMS queues | Queue/shared | Email and SMS Bull processors are registered with job constants. Moves communications off request paths. | Partial | SMTP/SMS provider configuration, Redis |
| Analytics and reports | Analytics | Dashboards, reports, advanced analytics, event listeners, analytics queue and UI routes exist. Supports operational and revenue insights. | Implemented | PostgreSQL, emitted events, Redis |
| Import, export and backup jobs | Data jobs | Import/export/backup controllers, data-job entity and Bull processors exist. Supports data portability and operations. | Partial | Redis, MinIO; restore verification not shown |
| Object storage | Storage | Storage controllers, file metadata entity and MinIO service manage stored assets. Supports attachments and generated files. | Implemented | MinIO |
| Scheduler and social scheduling | Scheduler/social | Scheduled-job records and a social scheduler with a once-per-minute cron exist. Supports scheduled posts/jobs. | Partial | PostgreSQL; social-provider connections not evidenced |
| Marketplace and plugins | Marketplace/plugins | Marketplace templates, plugin and tenant-plugin entities/controllers/services/UI manage catalog/installation metadata. Supports extensibility. | Partial | PostgreSQL; no sandboxed plugin runtime shown |
| Developer platform | Developer | OAuth apps/codes, webhooks/deliveries/logs and API logs are modelled and exposed. Supports external integrations. | Implemented | PostgreSQL, API keys |
| Support knowledge and tickets | Support | Support service/controller and article/ticket entities/UI exist. Supports internal/customer support operations. | Implemented | PostgreSQL |
| Admin and sub-admin consoles | Admin/sub-admin | Extensive controller/service/UI surfaces cover tenants, users, plans, queues, workers, security, logs, storage and settings. Supports delegated platform operations. | Implemented | RBAC, PostgreSQL, Redis |
| Health, logging and audit | Core/admin | Health endpoints, logger/Sentry wiring, audit/error/security entities and admin inspection endpoints exist. Supports operational visibility. | Partial | Sentry DSN and external log/alert tooling are optional/not configured |
| Local/prod deployment | Infrastructure | Docker Compose, nginx, Terraform and GitHub CI/deploy workflows are checked in. Supports a single-host deployment path. | Partial | AWS, GHCR, S3, SSM, secrets, TLS/bootstrap |
