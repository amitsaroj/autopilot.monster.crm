# Autopilot Monster CRM | Backend API Node

Welcome to the **Backend Control Plane** of the Autopilot Monster CRM. This layer is engineered using NestJS to provide a highly scalable, fully normalized, and thoroughly documented micro-monolith API.

## 🧬 Architectural Principles

*   **Dependency Injection:** A strict modular boundary model. Services isolate business logic from HTTP transport layers (Controllers).
*   **Zero-Trust Security:** Global Bearer Token guards via `JwtAuthGuard` and `TenantGuard`. Every request explicitly requires a valid JWT and an `x-tenant-id` header to ensure total data isolation.
*   **Event-Driven Workloads:** Long-running processes (CSV imports, AI training, bulk emails) are offloaded immediately to Redis Queues.
*   **Documentation as Code:** NestJS Swagger dynamically generates the OpenAPI schema directly from TypeScript decorators and Data Transfer Objects (DTOs), ensuring the frontend engineers always possess perfectly synchronized API contracts.

## 📚 Core Modules

1.  **AuthModule & TenantGuard:** Master control of JWT issuance, TOTP-MFA verification, UUID bindings, and RBAC arrays.
2.  **CrmModule:** Handles standard relations—Leads, Contacts, Companies, Pipelines (Deals), Notes, Tasks. Includes nested sub-services for deep analytical aggregations.
3.  **AiModule & Qdrant:** Ties directly into OpenAI embeddings and Qdrant vector databases for RAG workflows. Connects Agents to dynamic tools via semantic query structures.
4.  **CommunicationsModule:** Twilio (Voice/SMS), Email pipelines, and WhatsApp webhook processors.
5.  **Admin & Settings Modules:** Sub-administration system settings, rate-limiting parameter overrides, plan/billing tracking, and audit log generation.

## 🛠 Local Development

The backend is intended to be run exclusively via the container orchestrator defined in the parent directory (`docker-compose.yml`), which guarantees consistent network access to PostgreSQL, Redis, and MinIO.

However, to run scripts directly on the host machine:

```bash
# Install exact dependencies
npm install

# Start development server with SWC fast-compilation
npm run start:dev

# Build production artifacts targeting dist/
npm run build
```

## 🔒 Environment Requirements

You MUST supply exactly these secrets in `backend/.env` to successfully boot the NestFactory:
*   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
*   `REDIS_HOST`, `REDIS_PASSWORD`
*   `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
*   `JWT_SECRET`, `JWT_REFRESH_SECRET`
*   `QDRANT_URL`, `OPENAI_API_KEY` (For AI modules)

Failure to supply these will automatically halt the bootstrap process to protect against misconfigured staging/production setups.
