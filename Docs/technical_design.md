# Technical Design Principles
Project: autopilot.monster.crm

---

## 1. Core Engineering Philosophy

To maintain velocity while scaling an Enterprise SaaS, all engineers must adhere to the following principles across the AutopilotMonster monorepo.

### 1.1 "Thick Backend, Thin Client"
- Business logic, pricing limits, access control, and data transformation belong exclusively in the NestJS backend.
- The Next.js frontend should be exceptionally simple ("dumb"). It queries data, binds it to React components, and passes mutations back. We do not re-calculate pricing quotas in React.

### 1.2 "Fail Securely"
- The default state of every boolean evaluating permission is `false`.
- If a security check crashes or throws an error, the system must 500 or 403. It must never proceed to DB execution.

### 1.3 Asynchronous First
- Only perform operations synchronously in a controller request if the client *absolutely needs the immediate result to load their next screen*.
- Emails, webhook deliveries, data imports, scoring analytics, AI triggers—all of these must drop into BullMQ immediately and return `202 Accepted` to the UI, keeping API response times consistently under 100ms.

---

## 2. Monorepo Boundaries

We utilize a strict NX Workspace structure.

- `apps/ui`: Next.js frontend. No database access. Calls API via Fetch.
- `apps/core`: NestJS Core API. Contains all entity repositories.
- `apps/worker`: NestJS headless worker node. Connects to Redis BullMQ. Includes no HTTP listeners.

### 2.1 Shared Libraries (`libs/`)
- `libs/types`: Shared DTOs and TypeScript interfaces used by both UI and API to enforce an inviolable contract.
- `libs/database`: Houses TypeORM entities and Migrations. Imported by `core` and `worker`.

---

## 3. The 3-Tier NestJS Pattern

Every module (e.g., `deal`) aggressively separates responsibilities:

1. **`DealController`:** Extracts tokens, validates DTOs, parses URL params, handles HTTP status codes.
2. **`DealService`:** Core business logic. Validates constraints (e.g., "Cannot mark deal Won if Company missing"). Calls Repository. Emits Events.
3. **`DealRepository` (Extends BaseTenantRepository):** Executes the literal TypeORM or raw SQL queries.

If a Controller queries the database directly, or a Service manipulates `req.headers`, the PR will be rejected.
