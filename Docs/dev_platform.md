# API & Developer Platform
Project: autopilot.monster.crm

---

## 1. REST API Openness

Every action a tenant can perform in the React UI is powered by a fully documented, public REST API. Nothing is hidden.

### 1.1 Authentication
Third-party scripts authenticate via short-lived Personal Access Tokens (PATs) or long-lived API Keys.
- `x-api-key: ak_live_xxxxxxxxxxxxxx`
- `x-tenant-id: t_live_xxxxxxxxxxxxx`

### 1.2 Swagger / OpenAPI
The NestJS `@nestjs/swagger` module automatically generates the `swagger.json` representing all 400+ endpoints.
This is hosted publicly at `docs.autopilot.monster`.

## 2. API Keys Lifecycle

- Generating an API Key saves a hashed version in PostgreSQL (bcrypt).
- The raw key is shown exactly once to the user.
- Rollable at any time.
- Subject to the Tenant's `api_rate_limit` (standard is 300 req/min).

## 3. Sandboxes

Enterprise users have the option to generate a "Sandbox Tenant". 
This is an isolated slice of the DB with identical configuration and feature flags, but safe to run script tests against without polluting real revenue or pipeline metrics. Sandbox tenants delete their own data automatically every 30 days.
