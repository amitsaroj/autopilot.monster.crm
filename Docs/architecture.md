# Architecture Design
Project: autopilot.monster.crm  
Pattern: Modular NestJS Monorepo with Shared Core

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                            │
│   Next.js App Router (UI)   │   Mobile App   │   API      │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    EDGE / GATEWAY                          │
│   Nginx / CloudFlare   │  Rate Limit  │  TLS Termination  │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    API LAYER (NestJS)                      │
│                                                            │
│  apps/auth     apps/core     apps/webhooks                 │
│   (Auth)       (Main API)    (Webhook Gateway)             │
└──────────────────────────────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌─────────────────────┐
│PostgreSQL│ │  Redis   │ │       MinIO          │
│(Primary  │ │Cluster   │ │  (Object Storage)    │
│ + Read   │ │Cache +   │ │                      │
│ Replica) │ │Queues    │ │                      │
└──────────┘ └──────────┘ └─────────────────────┘
                          │
              ┌───────────┼
              ▼
┌─────────────────────┐
│     Qdrant           │
│  (Vector Database)   │
└─────────────────────┘
```

---

## 2. NestJS App Structure

```
apps/
├── core/               ← Main API (port 3000)
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── modules/
│   │   │   ├── crm/
│   │   │   ├── billing/
│   │   │   ├── pricing/
│   │   │   ├── workflow/
│   │   │   ├── ai/
│   │   │   ├── voice/
│   │   │   ├── whatsapp/
│   │   │   ├── notifications/
│   │   │   ├── analytics/
│   │   │   ├── tenant/
│   │   │   ├── rbac/
│   │   │   ├── plugin/
│   │   │   ├── marketplace/
│   │   │   ├── storage/
│   │   │   ├── search/
│   │   │   ├── logs/
│   │   │   ├── metrics/
│   │   │   ├── scheduler/
│   │   │   ├── import/
│   │   │   ├── export/
│   │   │   └── backup/
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── tenant.guard.ts
│   │   │   │   ├── role.guard.ts
│   │   │   │   ├── permission.guard.ts
│   │   │   │   ├── plan.guard.ts
│   │   │   │   ├── limit.guard.ts
│   │   │   │   └── rate-limit.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── transform.interceptor.ts
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   ├── audit.interceptor.ts
│   │   │   │   └── usage.interceptor.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── decorators/
│   │   │   │   ├── tenant.decorator.ts
│   │   │   │   ├── user.decorator.ts
│   │   │   │   ├── feature.decorator.ts
│   │   │   │   ├── limit.decorator.ts
│   │   │   │   └── permission.decorator.ts
│   │   │   └── pipes/
│   │   │       └── validation.pipe.ts
│   │   └── shared/
│   │       ├── database/
│   │       │   ├── database.module.ts
│   │       │   └── base-tenant.repository.ts
│   │       ├── cache/
│   │       │   └── cache.module.ts
│   │       ├── queue/
│   │       │   └── queue.module.ts
│   │       ├── event-bus/
│   │       │   └── event-bus.module.ts
│   │       ├── storage/
│   │       │   └── storage.module.ts
│   │       ├── mailer/
│   │       │   └── mailer.module.ts
│   │       └── config/
│   │           └── config.module.ts
│
├── auth/               ← Auth service (port 3001)
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── sessions/
│       └── mfa/
│
└── ui/                 ← Next.js frontend (port 3010)
    └── src/
        └── app/
            ├── (auth)/
            └── (app)/
```

---

## 3. Request Lifecycle

```
HTTP Request
    │
    ▼
Nginx (TLS, rate limit header injection)
    │
    ▼
NestJS HTTP Pipeline
    │
    ├── Middleware: TenantHeaderMiddleware (resolves x-tenant-id)
    │
    ├── Guards (in order):
    │   1. AuthGuard         → verifies JWT / API key
    │   2. TenantGuard       → loads tenant, checks status
    │   3. RoleGuard         → checks user role
    │   4. PermissionGuard   → checks resource:action
    │   5. PlanGuard         → checks feature flag
    │   6. LimitGuard        → checks usage quota
    │   7. RateLimitGuard    → checks Redis rate counter
    │
    ├── Interceptors (pre-handler):
    │   1. LoggingInterceptor  → logs request
    │   2. UsageInterceptor    → increments usage counter
    │
    ├── Pipes:
    │   1. ValidationPipe     → validates DTOs
    │
    ├── Controller Handler
    │   → calls Service → calls Repository
    │
    ├── Interceptors (post-handler):
    │   1. TransformInterceptor → wraps in { success, data, meta }
    │   2. AuditInterceptor     → writes audit log for mutations
    │
    ▼
HTTP Response
```

---

## 4. Module Communication Patterns

### 4.1 Synchronous (Direct Service Injection)

Used for: simple lookups, permission checks, data reads within the same request

```typescript
// pricing.service.ts is injected into other module services
constructor(
  private readonly pricingService: PricingService,
) {}

const isEnabled = await this.pricingService.isFeatureEnabled(tenantId, 'ai_chat');
```

### 4.2 Event-Driven (Internal Event Bus)

Used for: triggering side effects without coupling modules

```typescript
// CRM emits event
this.eventBus.emit(CRM_EVENTS.DEAL_WON, { tenantId, dealId, value });

// Billing module listens and records usage
@OnEvent(CRM_EVENTS.DEAL_WON)
async handleDealWon(payload: DealWonEvent): Promise<void> {
  await this.analyticsService.recordDealClose(payload);
}

// Workflow module listens and triggers automation
@OnEvent(CRM_EVENTS.DEAL_WON)
async handleDealWon(payload: DealWonEvent): Promise<void> {
  await this.workflowEngine.trigger('DEAL_EVENT', payload);
}
```

### 4.3 Queue-Based (BullMQ)

Used for: heavy async tasks, AI inference, email, voice, transcription

```typescript
await this.emailQueue.add('send', {
  tenantId,
  to: contact.email,
  templateId: 'welcome',
  data: { name: contact.firstName },
}, { delay: 5000 });
```

---

## 5. Shared Database Module

```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        database: config.get('DB_NAME'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
        extra: {
          max: 20,       // Connection pool max
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

---

## 6. Environment Variables

```bash
# App
NODE_ENV=production
PORT=3000
API_URL=https://api.autopilotmonster.com

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=autopilot_crm
DB_USER=autopilot
DB_PASS=secret

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secret

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_USE_SSL=false

# Qdrant
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=...

# Auth
JWT_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# OpenAI
OPENAI_API_KEY=...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Twilio (Voice)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# WhatsApp (Meta Cloud API)
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_ID=...
WHATSAPP_VERIFY_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email (SMTP)
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@autopilotmonster.com
```

---

## 7. Docker Compose Services

```yaml
services:
  core:          # NestJS API — port 3000
  auth:          # Auth service — port 3001
  ui:            # Next.js — port 3010
  postgres:      # PostgreSQL 15 — port 5432
  redis:         # Redis 7 — port 6379
  minio:         # MinIO — ports 9000/9001
  qdrant:        # Qdrant — port 6333
  bullboard:     # BullMQ dashboard — port 3030
  nginx:         # Reverse proxy — ports 80/443
```

---

## 8. Scalability Design

- **API**: Stateless, horizontally scalable. Deploy N replicas behind load balancer.
- **Workers**: BullMQ processors are separate pool. Scale independently per queue load.
- **Database**: Primary + 1 read replica. Connection pooling via PgBouncer for 1000+ tenants.
- **Redis**: Sentinel or Cluster mode for HA.
- **MinIO**: Distributed mode with 4+ nodes for production.
- **Qdrant**: Single node for <50M vectors; cluster mode for >50M.

---

## 9. Security Architecture

```
Transport:    TLS 1.3 everywhere
Auth:         JWT (RS256, short-lived) + opaque refresh tokens
API Keys:     SHA-256 hashed in DB, prefix-based lookup
Secrets:      Environment variables, never in DB plain text
Data:         tenant_id isolation on every query
RBAC:         Resource-level permission matrix
Rate Limits:  Per-tenant, per-user, per-IP via Redis
Audit:        All mutations logged with user + IP
Password:     bcrypt with cost factor 12
MFA:          TOTP (Google Authenticator compatible)
```
