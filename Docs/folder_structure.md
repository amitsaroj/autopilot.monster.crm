# Project Folder Structure
Project: autopilot.monster.crm

---

## 1. Monorepo Root

```text
autopilot.monster.crm/
├── apps/                 # Runnable applications
│   ├── core/             # Background API (NestJS)
│   ├── ui/               # Frontend Dashboard (Next.js)
│   └── worker/           # Background job processor (NestJS)
│
├── libs/                 # Shared libraries
│   ├── types/            # DTOs, Enums, Interfaces shared by UI & API
│   ├── database/         # TypeORM Entities, Migrations
│   ├── ui-kit/           # Shared React components (Design System)
│   └── utils/            # Helper functions
│
├── Docs/                 # Technical documentation 
├── .github/              # Actions CI/CD workflows
├── package.json          # Root workspace configuration
└── nx.json               # Nx Monorepo configuration
```

---

## 2. API Domain Structure (`apps/core/src/modules/`)

Every module follows a strict Domain-Driven Design pattern.

```text
modules/
├── auth/                 # Authentication, JWT, MFA
├── tenant/               # Workspaces, Users, Roles
├── crm/                  # Leads, Contacts, Deals, Tasks
├── billing/              # Subscriptions, Invoices, Usage
├── workflow/             # Engine, Steps, Executions
├── ai/                   # Prompts, Agents, RAG
├── voice/                # Twilio integration, Campaigns
└── whatsapp/             # Meta integration, Broadcasts
```

Inside each module:
```text
crm/
├── controllers/          # HTTP Endpoints
├── services/             # Business Logic
├── repositories/         # DB Abstraction
├── dto/                  # Validation definitions
├── events/               # Event definitions & listeners
├── crm.module.ts         # Module bundle
└── crm.service.spec.ts   # Unit tests
```
