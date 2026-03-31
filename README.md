# Autopilot Monster CRM Enterprise

An enterprise-grade, highly cohesive Customer Relationship Management (CRM) platform powered by AI and robust multi-tenant architecture. Engineered for scalability, absolute data isolation at the tenant level, and fault-tolerant cloud-native deployment.

---

## 🏗 Executive Architecture Overview

Autopilot Monster CRM represents the pinnacle of modern modular monolith design. Built upon a tightly coupled yet domain-driven backend, this repository houses both the **Next.js Frontend** and the **NestJS Backend**, orchestrated by Docker Compose for a frictionless developer experience and seamless continuous integration pipeline.

The backend leverages strict Dependency Injection (DI) and robust object-relational mapping (TypeORM) targeting PostgreSQL, heavily utilizing an asynchronous Event-Driven Architecture (EDA) to decouple heavy computational workloads such as AI generation tasks and bulk CRM imports.

### Technology Stack
*   **API Layer (Backend):** NestJS, TypeScript, TypeORM, Swagger API, Passport (JWT/MFA).
*   **Client Layer (Frontend):** Next.js (Standalone builds).
*   **Primary Datastore:** PostgreSQL 15 (Relational Data, JSONB extensions).
*   **Caching & Queueing:** Redis 7.
*   **Vector Database (AI):** Qdrant (RAG, Semantic Search).
*   **Object Storage:** MinIO (S3-Compatible Document Storage).

---

## 🔥 Enterprise Feature Matrix

### 1. Robust Multi-Tenancy
Data isolation is guaranteed at the repository and middleware levels. A custom `TenantGuard` and strict `TenantId` extraction ensures zero cross-tenant contamination. Every query implicitly scopes to the authenticated user's workspace context.

### 2. Advanced Authentication & RBAC
*   JWT-based access and refresh token rotation mechanisms.
*   Time-based One-Time Password (TOTP) Multi-Factor Authentication (MFA).
*   Granular Role-Based Access Control (RBAC) linking roles to highly specific feature permissions.
*   Brute-force lockout and session termination parameters.

### 3. CRM Domain Core
*   **Lead & Contact Management:** Bulk imports, deduplication.
*   **Sales Pipelines & Deals:** Kanban-style board endpoints, stage progressions.
*   **Quotes & Products:** Complex object linkages and financial tracking.

### 4. AI & Automations
*   Fully integrated semantic search and Retrieval-Augmented Generation (RAG) powered by Qdrant.
*   Omnichannel Campaign Management (Voice & WhatsApp).
*   Visual Automation Flow execution.

---

## 🛠 Local Environment Setup (Dockerized)

This repository is built for instant booting utilizing immutable infrastructure. We rely on Docker and Docker Compose to emulate the exact topology used in production.

### Step 1: Environment Provisioning
Initialize your local environment variables in both application boundaries.

**Backend (`backend/.env`):**
```properties
# System
NODE_ENV=development
APP_PORT=8000
APP_HOST=0.0.0.0

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=root
DB_PASSWORD=password
DB_NAME=autopilot_monster
DB_SYNCHRONIZE=true # Use strictly in local/dev; switch to Migrations in prod.

# External Services
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=password

MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=root
MINIO_SECRET_KEY=password123

# Security
JWT_SECRET=super_secret_key_123_456
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=super_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
```

**Frontend (`frontend/.env`):**
```properties
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Step 2: Bootstrapping the Platform
We leverage a flat `src/` directory structure built flawlessly utilizing parallel Docker builds. 

Run the container orchestrator from the project root:
```bash
docker compose up --build -d
```

### Step 3: Verification
*   **API & Swagger Documentation:** `http://localhost:8000`
*   **Next.js Frontend Client:** `http://localhost:3000`
*   **Adminer (Database Admin):** `http://localhost:8080`
*   **MinIO Console:** `http://localhost:9001`

---

## 🛡 API Usage & Authorization Strictness

The Swagger UI located at the root API URL acts as the authoritative live contract for the platform. 

The API employs a strict Zero-Trust model:
1.  **Public Routes:** Extremely restricted (e.g., `POST /api/v1/auth/register`, `POST /api/v1/auth/login`).
2.  **Global Authorization:** All other routes require a valid `Bearer Token` passed in the `Authorization` header, coupled closely with the `x-tenant-id` header indicating workspace context.
3.  **To Authenticate via Swagger:** Register a user, log in to retrieve the `accessToken`, and attach it to the `Authorize` (Padlock) button at the top of the UI.

---

## 🚀 Deployment Strategy (Production)

The platform has been optimized to separate volatile, horizontally scalable stateless layers (Frontend/Backend) from heavily persistent data stores (PostgreSQL/Redis).

### Backend (AWS Deployment)
The backend container (`backend/Dockerfile` using `node:20-alpine`) is production-hardened. It suppresses `devDependencies`, restricts payload injection, and utilizes global unhandled exception filters (`AllExceptionsFilter`). Deploy this image to AWS Elastic Container Service (ECS) Fargate or Elastic Beanstalk. Ensure `DB_SYNCHRONIZE=false` and use structured TypeORM migrations.

### Frontend (Vercel Deployment)
The Next.js application utilizes the Vercel-specific standalone output tracer. Deploy directly to Vercel targeting the `frontend` root directory and inject production environment variables representing the public-facing AWS backend load balancer URL.

---

## 🧠 Engineering Tenets

1.  **Explicit > Implicit:** If a guard blocks a route, it must be universally applied or beautifully bypassed (via `Reflector` mechanisms).
2.  **Silent Failures are Anti-patterns:** Global exception filters sanitize client responses while rigorously logging stack traces strictly to application monitors.
3.  **Separation of Concerns:** Controllers handle HTTP bindings. Services manage business logic. Repositories manage disk operations. Modularity is not an option; it's the fundamental baseline.
