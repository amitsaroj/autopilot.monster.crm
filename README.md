# autopilot.monster.crm

A multi-app monorepo CRM platform built with NestJS (backend) and Next.js (frontend).

## Project Structure

```
autopilot.monster.crm/
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── nest-cli.json
├── package.json
├── tsconfig.json
│
├── Docs/                                   # Project documentation
│   ├── HLD.md
│   ├── LLD.md
│   ├── MCP.md
│   ├── README.md
│   ├── admin_pricing.md
│   ├── ai_engine.md
│   ├── analytics_design.md
│   ├── api_scope.md
│   ├── architecture.md
│   ├── backup_restore.md
│   ├── billing_design.md
│   ├── build_order.md
│   ├── combined_features.md
│   ├── cost_model.md
│   ├── cost_rules.md
│   ├── crm_design.md
│   ├── data_flow.md
│   ├── data_lifecycle.md
│   ├── database_design.md
│   ├── dev_platform.md
│   ├── disaster_recovery.md
│   ├── event_bus.md
│   ├── feature_flags.md
│   ├── feature_runtime.md
│   ├── folder_structure.md
│   ├── ha_multi_region.md
│   ├── id_strategy.md
│   ├── infra_design.md
│   ├── internal_tools.md
│   ├── limit_runtime.md
│   ├── limits.md
│   ├── marketplace_design.md
│   ├── module_control.md
│   ├── module_manifest.md
│   ├── performance_scaling.md
│   ├── plan_change.md
│   ├── plan_middleware.md
│   ├── plugin_pricing.md
│   ├── pricing_api.md
│   ├── pricing_events.md
│   ├── pricing_limits_runtime.md
│   ├── pricing_model.md
│   ├── pricing_notifications.md
│   ├── pricing_permissions.md
│   ├── pricing_runtime.md
│   ├── pricing_scope.md
│   ├── prompts.md
│   ├── qa_batch1.md ... qa_batch12.md
│   ├── rate_limit.md
│   ├── retry_strategy.md
│   ├── scheduler.md
│   ├── security.md
│   ├── service_interaction.md
│   ├── skills.md
│   ├── state_machine.md
│   ├── subscription_state.md
│   ├── technical_design.md
│   ├── template_system.md
│   ├── tenant_design.md
│   ├── tenant_override.md
│   ├── ui_builder.md
│   ├── ui_pricing_rules.md
│   ├── upgrade_strategy.md
│   ├── usage_billing_flow.md
│   ├── voice_engine.md
│   ├── whatsapp_design.md
│   ├── worker_system.md
│   └── workflow_engine.md
│
└── apps/
    ├── auth/                               # Auth microservice (NestJS)
    │   ├── tsconfig.json
    │   ├── test/
    │   │   └── unit/
    │   └── src/
    │       ├── auth.controller.ts
    │       ├── auth.module.ts
    │       ├── auth.repository.ts
    │       ├── auth.service.ts
    │       ├── index.ts
    │       ├── dto/
    │       │   └── auth.dto.ts
    │       ├── entities/
    │       │   ├── refresh-token.entity.ts
    │       │   ├── session.entity.ts
    │       │   └── user.entity.ts
    │       ├── guards/
    │       │   ├── jwt-auth.guard.ts
    │       │   └── local-auth.guard.ts
    │       ├── interfaces/
    │       │   ├── auth-tokens.interface.ts
    │       │   ├── auth-user.interface.ts
    │       │   └── jwt-payload.interface.ts
    │       └── strategies/
    │           ├── jwt.strategy.ts
    │           └── local.strategy.ts
    │
    ├── core/                               # Core shared microservice (NestJS)
    │   ├── tsconfig.json
    │   ├── test/
    │   │   ├── e2e/
    │   │   └── unit/
    │   └── src/
    │       ├── app.module.ts
    │       ├── index.ts
    │       ├── main.ts
    │       ├── cache/
    │       │   ├── cache.module.ts
    │       │   └── index.ts
    │       ├── common/
    │       │   ├── index.ts
    │       │   ├── constants/
    │       │   │   ├── app.constants.ts
    │       │   │   ├── error-codes.constants.ts
    │       │   │   └── index.ts
    │       │   ├── decorators/
    │       │   │   ├── api-tenant-header.decorator.ts
    │       │   │   ├── current-user.decorator.ts
    │       │   │   ├── index.ts
    │       │   │   ├── permission.decorator.ts
    │       │   │   ├── plan-feature.decorator.ts
    │       │   │   ├── public.decorator.ts
    │       │   │   ├── roles.decorator.ts
    │       │   │   └── tenant-id.decorator.ts
    │       │   ├── filters/
    │       │   │   ├── all-exceptions.filter.ts
    │       │   │   ├── http-exception.filter.ts
    │       │   │   └── index.ts
    │       │   ├── guards/
    │       │   │   ├── index.ts
    │       │   │   ├── jwt-auth.guard.ts
    │       │   │   ├── plan.guard.ts
    │       │   │   ├── roles.guard.ts
    │       │   │   └── tenant.guard.ts
    │       │   ├── interceptors/
    │       │   │   ├── correlation-id.interceptor.ts
    │       │   │   ├── index.ts
    │       │   │   ├── logging.interceptor.ts
    │       │   │   └── transform.interceptor.ts
    │       │   ├── interfaces/
    │       │   │   ├── api-response.interface.ts
    │       │   │   ├── base-repository.interface.ts
    │       │   │   ├── index.ts
    │       │   │   ├── paginated-result.interface.ts
    │       │   │   └── request-context.interface.ts
    │       │   ├── pipes/
    │       │   │   ├── index.ts
    │       │   │   ├── parse-uuid.pipe.ts
    │       │   │   └── validation.pipe.ts
    │       │   └── types/
    │       │       ├── deep-partial.type.ts
    │       │       ├── index.ts
    │       │       ├── nullable.type.ts
    │       │       ├── optional.type.ts
    │       │       └── uuid.type.ts
    │       ├── config/
    │       │   ├── app.config.ts
    │       │   ├── database.config.ts
    │       │   ├── index.ts
    │       │   ├── jwt.config.ts
    │       │   ├── minio.config.ts
    │       │   ├── qdrant.config.ts
    │       │   ├── redis.config.ts
    │       │   └── throttle.config.ts
    │       ├── database/
    │       │   ├── data-source.ts
    │       │   ├── database.module.ts
    │       │   ├── index.ts
    │       │   ├── entities/
    │       │   │   └── base.entity.ts
    │       │   └── migrations/
    │       │       └── .gitkeep
    │       ├── events/
    │       │   ├── event-bus.module.ts
    │       │   ├── event.constants.ts
    │       │   ├── index.ts
    │       │   └── interfaces/
    │       │       └── domain-event.interface.ts
    │       ├── health/
    │       │   ├── health.controller.ts
    │       │   ├── health.module.ts
    │       │   └── index.ts
    │       ├── logger/
    │       │   ├── index.ts
    │       │   ├── logger.module.ts
    │       │   └── logger.service.ts
    │       ├── queue/
    │       │   ├── index.ts
    │       │   ├── queue.constants.ts
    │       │   └── queue.module.ts
    │       └── storage/
    │           ├── index.ts
    │           ├── storage.module.ts
    │           └── storage.service.ts
    │
    └── ui/                                 # Next.js frontend
        ├── next.config.mjs
        ├── next-env.d.ts
        ├── package.json
        ├── postcss.config.js
        ├── tailwind.config.ts
        ├── tsconfig.json
        └── src/
            ├── lib/
            │   ├── constants.ts
            │   └── utils.ts
            ├── components/
            │   ├── providers.tsx
            │   ├── layout/
            │   │   ├── header.tsx
            │   │   └── sidebar.tsx
            │   └── ui/
            │       └── page-placeholder.tsx
            └── app/
                ├── globals.css
                ├── layout.tsx
                ├── page.tsx
                ├── (auth)/
                │   ├── login/
                │   │   └── page.tsx
                │   ├── register/
                │   ├── forgot-password/
                │   └── reset-password/
                └── (app)/
                    ├── layout.tsx
                    ├── dashboard/
                    │   └── page.tsx
                    ├── admin/
                    │   ├── page.tsx
                    │   ├── audit/
                    │   │   └── page.tsx
                    │   ├── feature-flags/
                    │   │   ├── page.tsx
                    │   │   └── new/
                    │   │       └── page.tsx
                    │   ├── health/
                    │   │   └── page.tsx
                    │   ├── limits/
                    │   │   └── page.tsx
                    │   ├── metrics/
                    │   │   └── page.tsx
                    │   ├── pricing/
                    │   │   └── plans/
                    │   │       ├── page.tsx
                    │   │       ├── new/
                    │   │       └── [id]/
                    │   ├── subscriptions/
                    │   │   └── page.tsx
                    │   ├── tenants/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   └── [id]/
                    │   │       ├── page.tsx
                    │   │       ├── billing/
                    │   │       └── users/
                    │   └── users/
                    │       ├── page.tsx
                    │       └── new/
                    │           └── page.tsx
                    ├── ai/
                    │   ├── page.tsx
                    │   ├── agents/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   └── [id]/
                    │   ├── chat/
                    │   │   └── page.tsx
                    │   ├── conversations/
                    │   │   └── page.tsx
                    │   ├── fine-tuning/
                    │   │   └── page.tsx
                    │   ├── knowledge-base/
                    │   │   ├── page.tsx
                    │   │   └── upload/
                    │   ├── prompts/
                    │   │   └── page.tsx
                    │   ├── settings/
                    │   │   └── page.tsx
                    │   └── usage/
                    │       └── page.tsx
                    ├── analytics/
                    │   ├── page.tsx
                    │   ├── crm/
                    │   ├── dashboards/
                    │   ├── export/
                    │   ├── pipeline/
                    │   ├── reports/
                    │   ├── revenue/
                    │   └── team/
                    ├── backup/
                    │   └── page.tsx
                    ├── billing/
                    │   ├── page.tsx
                    │   ├── invoices/
                    │   │   ├── page.tsx
                    │   │   └── [id]/
                    │   ├── payment-methods/
                    │   │   └── page.tsx
                    │   ├── upgrade/
                    │   │   └── page.tsx
                    │   └── usage/
                    │       └── page.tsx
                    ├── builder/
                    │   ├── page.tsx
                    │   ├── forms/
                    │   ├── pages/
                    │   ├── publish/
                    │   ├── tables/
                    │   └── themes/
                    ├── crm/
                    │   ├── activities/
                    │   │   └── page.tsx
                    │   ├── calendar/
                    │   ├── companies/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   └── [id]/
                    │   ├── contacts/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   │   └── page.tsx
                    │   │   ├── export/
                    │   │   ├── import/
                    │   │   ├── merge/
                    │   │   ├── segments/
                    │   │   ├── tags/
                    │   │   └── [id]/
                    │   ├── custom-fields/
                    │   ├── deals/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   ├── forecast/
                    │   │   └── [id]/
                    │   ├── forecast/
                    │   ├── leads/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   ├── import/
                    │   │   ├── sources/
                    │   │   └── [id]/
                    │   ├── notes/
                    │   │   └── page.tsx
                    │   ├── pipelines/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   └── [id]/
                    │   ├── products/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   └── [id]/
                    │   ├── quotes/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   └── [id]/
                    │   ├── reports/
                    │   │   └── page.tsx
                    │   ├── tasks/
                    │   │   ├── page.tsx
                    │   │   ├── new/
                    │   │   └── [id]/
                    │   └── timeline/
                    ├── export/
                    │   └── page.tsx
                    ├── import/
                    │   └── page.tsx
                    ├── inbox/
                    │   ├── page.tsx
                    │   ├── conversations/
                    │   └── settings/
                    ├── logs/
                    │   ├── page.tsx
                    │   ├── api/
                    │   ├── audit/
                    │   └── webhooks/
                    ├── marketplace/
                    │   ├── page.tsx
                    │   ├── installed/
                    │   └── [id]/
                    ├── notifications/
                    │   ├── page.tsx
                    │   └── settings/
                    ├── onboarding/
                    │   └── page.tsx
                    ├── plugins/
                    │   ├── page.tsx
                    │   ├── new/
                    │   └── [id]/
                    ├── search/
                    │   └── page.tsx
                    ├── settings/
                    │   ├── page.tsx
                    │   ├── api/
                    │   │   └── page.tsx
                    │   ├── data/
                    │   │   └── page.tsx
                    │   ├── integrations/
                    │   │   ├── page.tsx
                    │   │   └── sso/
                    │   ├── notifications/
                    │   │   └── page.tsx
                    │   ├── password/
                    │   │   └── page.tsx
                    │   ├── profile/
                    │   │   └── page.tsx
                    │   ├── roles/
                    │   │   └── page.tsx
                    │   ├── users/
                    │   │   ├── page.tsx
                    │   │   └── invite/
                    │   └── workspace/
                    │       └── page.tsx
                    ├── storage/
                    │   ├── page.tsx
                    │   ├── folders/
                    │   └── [id]/
                    ├── usage/
                    │   └── page.tsx
                    ├── voice/
                    │   ├── page.tsx
                    │   ├── calls/
                    │   ├── campaigns/
                    │   ├── settings/
                    │   └── transcripts/
                    ├── whatsapp/
                    │   ├── page.tsx
                    │   ├── broadcast/
                    │   ├── conversations/
                    │   ├── settings/
                    │   └── templates/
                    └── workflows/
                        ├── page.tsx
                        ├── builder/
                        │   └── page.tsx
                        ├── logs/
                        │   └── page.tsx
                        ├── templates/
                        │   └── page.tsx
                        └── [id]/
                            ├── page.tsx
                            ├── edit/
                            └── runs/
```

## Apps Overview

| App | Type | Description |
|-----|------|-------------|
| `apps/auth` | NestJS | Authentication microservice — JWT, sessions, strategies |
| `apps/core` | NestJS | Shared infrastructure — DB, cache, queue, storage, events |
| `apps/ui` | Next.js 14 | Frontend — App Router, Tailwind CSS |

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, BullMQ, MinIO, Qdrant
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, TypeScript
- **Auth**: JWT, Passport.js (local + JWT strategies)
- **Queue**: BullMQ (Redis)
- **Storage**: MinIO (S3-compatible)
- **Vector DB**: Qdrant (AI/embeddings)
