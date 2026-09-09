# Autopilot Monster CRM — Repository Map

**Audit date:** 2026-07-22  
**Repo root:** `/data/Antier-project/Demo/autopilots.monster.crm`  
**Method:** Static discovery (no runtime). Docs purged via recent merges — missing Docs ≠ missing features.

---

## High-level layout

```
autopilots.monster.crm/
├── backend/                 # NestJS 11 modular monolith (API)
├── frontend/                # Next.js 16 App Router (UI)
├── Docs/                    # Remnant design docs only (5 files)
├── tasks/                   # TASKS.md work log
├── .agents/rules/           # Agent build/phase/task rules
├── .github/workflows/       # ci.yml, deploy.yml
├── nginx/                   # Edge proxy (HTTP; TLS commented)
├── docker-compose.yml       # Local: postgres, redis, minio, qdrant, api, ui, adminer
├── docker-compose.prod.yml  # Prod compose (defective — dual Postgres, no ui)
├── main.tf / provider.tf / outputs.tf  # Single EC2 Terraform stub
├── project-audit/           # This audit wave
└── README.md                # Aspirational topology (≠ code)
```

**Not present:** `.ai/`, `.cursor/`, `coding-standards.md`, `CONTRIBUTING_FRONTEND.md`, `TASK.md` (root), `scripts/` (deleted), k8s/helm, MongoDB, root `.env.example`.

---

## Tech stack (verified)

| Layer | Technology | Evidence |
|-------|------------|----------|
| Backend | NestJS 11 + Express | `backend/package.json`, `backend/src/main.ts` |
| ORM / DB | TypeORM + PostgreSQL | `@nestjs/typeorm`, `pg`, `backend/src/database/` |
| Cache / queues | Redis + Bull + BullMQ | `queue/`, `workflow/workflow.module.ts` |
| Vectors | Qdrant | `@qdrant/js-client-rest`, compose `qdrant` |
| Object storage | MinIO | `backend/src/storage/` |
| Auth | Passport JWT/local + OAuth + MFA | `backend/src/modules/auth/` |
| Payments | Stripe (real); Razorpay/PayPal stubs | `modules/billing/` |
| Voice | Twilio | `modules/voice/` |
| WhatsApp | Meta webhook + Bull broadcast | `modules/whatsapp/` |
| AI | OpenAI SDK + RAG | `modules/ai/` |
| Frontend | Next.js 16 + React 19 + Tailwind | `frontend/package.json` |
| API client | Axios + Zustand auth | `frontend/src/lib/api/client.ts`, `hooks/use-auth.ts` |
| Infra | Docker Compose + Terraform EC2 | compose files, `main.tf` |
| CI/CD | GitHub Actions | `.github/workflows/{ci,deploy}.yml` |

---

## Backend structure

```
backend/src/
├── main.ts, app.module.ts (CoreModule)
├── common/          # guards, pipes, filters, interceptors
├── database/        # entities (~78), migrations (9), data-source
├── queue/, cache/, events/, storage/, health/, shared/email/, logger/
└── modules/
    ├── auth, crm, tenant, tenant-settings, rbac, users
    ├── ai, voice, whatsapp, workflow, social
    ├── billing + monetization, notifications, analytics
    ├── admin (~50 controllers), sub-admin (~15)
    ├── platform (search, audit-log read, marketplace, plugins)
    ├── data-jobs (import/export/backup), scheduler, support
    ├── developer/   # NOT imported by CoreModule
    └── marketplace/ # templates module NOT imported (catalog via PlatformModule)
```

**API prefix:** `api/v1` · **Swagger:** `/api/docs` (non-prod)  
**Counts:** 124 controllers · ~84 entity files · 9 migrations · 11 unit specs · 52 integration specs

**Wired in CoreModule:** Ai, Voice, Whatsapp, Workflow, Crm, Tenant, Rbac, Monetization, Notifications, Platform, Users, Admin, Social, SubAdmin, Auth, TenantSettings, Scheduler, Support, Analytics, DataJobs + infra.

**Unwired:** `DeveloperModule`, standalone `MarketplaceModule` (templates), Omnichannel, Duplicate merge controller, several duplicate/stub controllers.

---

## Frontend structure

```
frontend/src/
├── app/
│   ├── (app)/          ~180 tenant pages (/dashboard, /crm/*, /whatsapp, /voice, /ai, …)
│   ├── admin/          ~77 tenant-admin pages
│   ├── superadmin/     ~31 platform-admin pages
│   ├── (auth)/         login, register, MFA, forgot/reset, verify-email
│   ├── (marketing)/    ~32 public marketing pages
│   ├── onboarding/     ~4
│   └── crm/quotes/view/[token]/  public quote
├── components/         crm, billing, FlowBuilder, layout, marketing, settings, social, ui
├── services/           121 *.service.ts modules
├── hooks/              use-auth, use-permission, …
└── lib/api/client.ts   Axios + Bearer cookie + x-tenant-id
```

**Counts:** 334 `page.tsx` routes · 121 services · **0** frontend tests

---

## Infra / ops

| Artifact | Role | Readiness |
|----------|------|-----------|
| `docker-compose.yml` | Local full stack | Dev-usable |
| `docker-compose.prod.yml` | Prod stack | **Not ready** (dual `postgres`+`db`, no `ui`, TLS absent) |
| `nginx/nginx.conf` | API proxy | HTTP-only stub |
| Terraform | Single `t3.medium` EC2 + EIP | Bootstrap stub ≠ README Fargate/RDS |
| `ci.yml` | Backend build/unit/integration; frontend build only | Partial |
| `deploy.yml` | Terraform + GHCR API + SSM compose | Fragile; no frontend deploy |

---

## Docs / rules remnants

| Path | Notes |
|------|-------|
| `Docs/{HLD,LLD,security,crm_design,README}.md` | Design remnants; HLD/LLD still describe obsolete `apps/*` layout |
| `tasks/TASKS.md` | Historical “completed” claims; open P0s remain in file body |
| `.agents/rules/{build-rules,phase-exicution-rules,task-plan}.md` | Agent always-on rules |

---

## Data plane (compose)

Postgres 15 · Redis 7 · MinIO · Qdrant · **No MongoDB**
