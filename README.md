# Autopilot Monster CRM | Enterprise Monorepo

Welcome to the **Autopilot Monster CRM**—a next-generation, AI-driven Customer Relationship Management platform. Engineered utilizing 50-year veteran principles of modular monolith architecture, strict domain-driven design (DDD), and event-driven asynchronous processing. This platform guarantees complete tenant isolation, fault-tolerant infrastructure, and scalable cloud-native deployments.

## 🌟 The Complete Feature Ecosystem

Our platform is not just a CRM; it is a meticulously crafted suite of business administration, communication, and artificial intelligence tools.

### 🏢 1. Tenant & Master Admin Management
- **Strict Multi-Tenancy:** 100% data isolation utilizing UUID `targetId` parameters bound dynamically across every TypeORM repository. Cross-pollination of tenant data is physically impossible.
- **Admin Dashboard:** Master administrative overrides, global settings, and usage/cost rules monitoring.
- **Tenant Self-Service:** Full tenant lifecycle control, tenant-specific UI branding, custom domains, and standalone workspace provisioning.

### 🔐 2. Advanced Security & Access Control
- **Authentication:** Zero-trust architecture. Public routes are explicitly whitelisted. JWT tokens validate short-lived sessions, reinforced by hardware-level IP black-listing and active session tracking.
- **Time-Based MFA:** Two-factor authentication enforced natively for all administrative users utilizing time-based OTPs, generated securely on-device.
- **Granular RBAC:** Role-Based Access Control mapped via dynamic permissions dictionaries. Custom roles define access down to the HTTP method and entity level.

### 💼 3. Complete CRM Suite
- **Lead Ingestion Pipeline:** CSV bulk uploading powered by streaming parsers. Lead deduplication logic and automated AI-powered tagging.
- **Contacts & Companies:** Fully relational data graphs linking individual professionals to corporate entities, tracking complete multi-channel interaction history.
- **Deal Kanban Boards:** Drag-and-drop React-based pipeline progression. Real-time deal valuation and pipeline-stage transitions.
- **Financial Objects:** Full tracking of Products, Invoices, Payments, and Quotes with multi-currency abstractions.

### 🤖 4. Autonomous AI Agents & Omnichannel Communication
- **Agent Provisioning:** Customizable AI Personas tied to specific tenants.
- **RAG & Vector Memory:** Powered by Qdrant. Upload enterprise documents directly into MinIO storage, vectorized and injected dynamically into prompt contexts.
- **Twilio Voice & SMS:** Bidirectional calling arrays, intelligent routing, and SMS broadcasting.
- **WhatsApp Meta Integration:** Automated WhatsApp business flows and deep integration with CRM contact activity logs.

### 📊 5. Analytics & Background Processing
- **Event-Driven Architecture:** Relies on Redis queues and NestJS Event emitters. Heavy lifting (bulk email, lead scoring, PDF generation) never blocks the HTTP thread.
- **System Activity & Audit Logs:** Every write mutation is captured and retained in append-only audit tables for compliance.
- **Live Dashboards:** Aggregated metrics built flawlessly on the Next.js presentation layer.

---

## 🏗 Infrastructure Topology

We utilize Docker Compose natively to mirror the precise topology of our targeted AWS/Vercel production environments.

1.  **Vercel / AWS Amplify (Frontend Client):** Headless Next.js 14 frontend utilizing Server-Side Rendering (SSR) and Edge networks.
2.  **AWS Fargate / ECS (Backend API):** NestJS 10 backend running on Alpine Linux Node containers, connected to an internal VPC.
3.  **Amazon RDS (PostgreSQL 15):** The single source of truth for relational state.
4.  **Amazon ElastiCache (Redis 7):** Job queue states, pub/sub mechanisms, and token blacklisting.
5.  **Amazon S3 (MinIO Local):** Highly available object storage for avatars, CSV uploads, and RAG document repositories.
6.  **Qdrant Cloud (Vector DB):** 1536-dimensional embeddings storage for GPT-4 integrations.

---

## 🛠 Project Workspace Structure

```bash
autopilot.monster.crm/
├── backend/               # NestJS 10 (TypeScript, TypeORM, Swagger)
│   ├── Dockerfile         # Production AWS Target (Standalone build)
│   ├── src/               # Flat, modular domain logic
│   └── package.json
├── frontend/              # Next.js 14 (App Router, Tailwind, Framer Motion)
│   ├── Dockerfile         # Standalone Client Target
│   ├── src/               # UI Components, Hooks, API generated services
│   └── package.json
├── docker-compose.yml     # Local unified orchestration matrix
└── .env.example           # Secure parameter injection templates
```

## 🚀 Getting Started

To launch the entire enterprise stack on your local machine:

1. Copy `.env` files into both `frontend/` and `backend/`.
2. Ensure Docker Engine is running on your host.
3. Execute the orchestrator:
   ```bash
   docker compose up --build -d
   ```
4. **Access the Modules:**
   - Next.js Platform: `http://localhost:3000`
   - Master Swagger API: `http://localhost:8000`
   - Adminer DB Console: `http://localhost:8080`
   - MinIO Storage Console: `http://localhost:9001`
