# Infrastructure Audit Report — Autopilot Monster CRM

**Date:** 2026-06-19  
**Auditor:** Agent 14 — DevOps & Infra  
**Scope:** Docker, CI/CD, monitoring, logging, backups, DR, health checks, Redis, MinIO, Qdrant, Postgres

---

## Executive Summary

| Area | Pre-Audit | Post-Fix | Risk |
|------|-----------|----------|------|
| Docker (dev) | Partial — MinIO disabled, no Qdrant | Fixed | Was **Critical** |
| Docker (prod) | Missing Postgres/MinIO, no healthchecks | Fixed | Was **Critical** |
| CI/CD | Functional backend pipeline | Unchanged | Low |
| Health probes | DB-only readiness | Extended | Was **High** |
| Backups / DR | API stubs only | Documented | **High** (open) |
| Monitoring | Sentry + Winston | Unchanged | Medium gap |
| Logging | Winston JSON console | Adequate for dev | Medium gap |
| Queue (Bull/BullMQ) | Redis-backed | Verified | Low |

**Overall infra readiness: ~62% → ~78%** after critical fixes. Production deploy is structurally sound; automated DR and observability stack remain gaps.

---

## 1. Docker

### 1.1 Development — `docker-compose.yml`

| Service | Status | Notes |
|---------|--------|-------|
| Postgres 15 | OK | Healthcheck via `pg_isready` |
| Redis 7 | Fixed | Added healthcheck + password auth |
| MinIO | **Fixed** | Was commented out; app requires MinIO config |
| Qdrant | **Added** | Parity with prod AI/RAG stack |
| API | **Fixed** | Healthcheck, env wiring, `DB_SYNCHRONIZE` default false |
| UI (Next.js) | OK | Build arg for API URL |
| Adminer | OK | Dev-only DB UI |

**Issues found (fixed):**
- MinIO commented while `MINIO_ENDPOINT=minio` set on API → storage module would fail at runtime.
- Redis had no healthcheck; API started before Redis was ready.
- `DB_SYNCHRONIZE=true` hardcoded — unsafe even in dev.
- Missing `REDIS_PASSWORD`, MinIO, and Qdrant env vars on API service.
- No container healthcheck on API.

### 1.2 Production — `docker-compose.prod.yml`

| Service | Pre-Audit | Post-Fix |
|---------|-----------|----------|
| nginx | Present | Health-gated on API |
| postgres | **Missing** | **Added** with volume + healthcheck |
| redis | Present | Healthcheck added |
| minio | **Missing** | **Added** with volume + healthcheck |
| qdrant | Present | Healthcheck added |
| api | No healthcheck | Healthcheck + dependency conditions |
| certbot | Present | Unchanged |
| frontend/ui | Missing | Not in scope (API-only EC2 deploy) |

**Issues found (fixed):**
- No Postgres service — deploy assumed external DB with no documentation or env template.
- No MinIO — file storage and tenant backups depend on object storage.
- `depends_on` without health conditions — race on startup.
- No API healthcheck for nginx/orchestrator.

### 1.3 Dockerfiles

| File | Finding | Fix |
|------|---------|-----|
| `backend/Dockerfile` | `CMD npm run start` triggered `prestart` seed on every prod boot | **Fixed:** `CMD node dist/main` + Dockerfile `HEALTHCHECK` |
| `backend/Dockerfile` | No `HEALTHCHECK` | **Fixed:** probes `/api/v1/health/ready` |
| `frontend/Dockerfile` | Adequate multi-stage build | No change |

**Remaining:** Frontend Dockerfile has no `HEALTHCHECK`. Add when UI is deployed via compose.

---

## 2. CI/CD

### 2.1 `.github/workflows/ci.yml`

| Check | Status |
|-------|--------|
| Trigger on main/develop PR/push | OK |
| Postgres 16 service + health | OK |
| Redis 7 service + health | OK |
| MinIO service + health | OK |
| Backend build | OK |
| Unit tests | OK |
| E2E integration tests | OK |
| Frontend build | OK |
| Migration run in CI | Missing |
| Frontend tests | Missing |
| SAST / dependency audit | Missing |
| Qdrant in CI | Missing (RAG tests may skip) |

### 2.2 `.github/workflows/deploy.yml`

| Step | Status | Notes |
|------|--------|-------|
| AWS credentials | OK | ap-south-1 |
| Terraform EC2 + EIP | OK | t3.medium, 30GB gp3, Docker preinstalled |
| GHCR image push | OK | Backend only |
| S3 state bucket bootstrap | OK | Versioning enabled |
| Config sync to S3 | **Fixed** | No longer fails when `.env.production` absent from repo |
| SSM deploy | OK | Pull, migrate, up |
| Rollback strategy | Missing | Manual |
| Blue/green or canary | Missing | Single instance |

**Critical fix:** Deploy previously ran `aws s3 cp backend/.env.production` — file did not exist in repo, breaking every deploy sync step. Now conditional; production secrets must live on S3 at `deploy/backend/.env.production` (see `backend/.env.production.example`).

### 2.3 Terraform (`main.tf`, `provider.tf`)

| Resource | Status |
|----------|--------|
| EC2 + EIP | OK |
| SSM IAM role | OK |
| S3 read-only for instance | OK |
| Security group (80/443) | OK |
| RDS / managed Postgres | Not provisioned — uses compose Postgres on EC2 |
| Backup bucket / lifecycle | Missing |
| CloudWatch agent | Missing |

---

## 3. Health Checks

### 3.1 Application — `backend/src/health/health.controller.ts`

| Endpoint | Path | Checks |
|----------|------|--------|
| Liveness | `GET /api/v1/health` | Postgres, heap, disk, Redis, Qdrant*, MinIO* |
| Readiness | `GET /api/v1/health/ready` | Postgres, Redis, Qdrant*, MinIO* |

\*Qdrant and MinIO checks run when `QDRANT_URL` / `MINIO_ENDPOINT` are set.

**Fixes applied:**
- Readiness now includes Redis (queues/cache depend on it).
- Optional HTTP pings for Qdrant (`/healthz`) and MinIO (`/minio/health/live`).
- Docker and Dockerfile healthchecks target `/api/v1/health/ready`.

**Note:** Global prefix is `api/v1` — probes must not use bare `/health`.

### 3.2 Admin health — `admin-health.service.ts`

Returns process metrics (uptime, memory, CPU). Does not verify downstream dependencies. Suitable for SuperAdmin dashboard only.

### 3.3 nginx

**Fixed:** Dedicated `/api/v1/health` location without rate limiting for probe traffic.

---

## 4. Queue System & Redis

| Component | Implementation | Status |
|-----------|----------------|--------|
| Bull (legacy) | `queue.module.ts` — 12 named queues | OK |
| BullMQ | `workflow.module.ts` — workflow processor | OK |
| Redis config | `redis.config.ts` via env | OK |
| Admin queue API | `admin-queues.controller.ts` | OK |

**Dev compose:** Redis password `password` now propagated to API via `REDIS_PASSWORD`.

**Prod compose:** Uses `${REDIS_PASSWORD}` from `.env.production`.

**Gap:** Two queue libraries (Bull + BullMQ) on same Redis — acceptable but increases operational complexity. Consolidate in a future sprint.

---

## 5. Postgres

| Environment | Config | Status |
|-------------|--------|--------|
| Dev compose | `autopilot_monster`, user `root` | OK |
| `.env.example` | DB name `autopilot_crm` — **mismatch** | Document only |
| Prod compose | **Added** Postgres 15 + `pg_prod_data` volume | Fixed |
| Migrations | `migrate:prod` in deploy SSM | OK |
| `DB_SYNCHRONIZE` | Now `false` in prod compose and dev default | Fixed |

**Recommendation:** Align `.env.example` DB name with compose (`autopilot_monster`) or document intentional split.

---

## 6. MinIO (Object Storage)

| Item | Status |
|------|--------|
| Config | `minio.config.ts` — buckets for assets + backups |
| Dev compose | **Enabled** |
| Prod compose | **Added** |
| CI service | Present |
| Health probe | **Added** in app + compose |
| Bucket bootstrap job | Missing — buckets must be created on first run |

**Restore dependency:** Tenant backup/export flows store artifacts in MinIO (`MINIO_BUCKET_BACKUPS`).

---

## 7. Qdrant (Vector DB)

| Item | Status |
|------|--------|
| Config | `qdrant.config.ts` |
| Dev compose | **Added** |
| Prod compose | Present + healthcheck |
| CI | Not provisioned |
| RAG service | Uses `@qdrant/js-client-rest` |
| Health probe | **Added** (`/healthz`) |

---

## 8. Monitoring & Observability

| Item | Status | Location |
|------|--------|----------|
| Sentry | Initialized | `main.ts` — requires `SENTRY_DSN` |
| Winston structured logs | OK | `logger.module.ts` — JSON in prod |
| Prometheus `/metrics` | **Missing** | TASK-033 |
| APM beyond Sentry | Missing | — |
| Admin telemetry | Partial | Queues, storage admin APIs |
| CloudWatch / Grafana | Missing | No infra in repo |
| Uptime external probe | Missing | — |

**Sentry note:** `tracesSampleRate: 1.0` in production will increase cost — tune to 0.1–0.2 before go-live.

---

## 9. Logging

| Layer | Implementation |
|-------|----------------|
| Application | Winston via `nest-winston`, `LOG_LEVEL` + `LOG_FORMAT` |
| HTTP access | NestJS default — no dedicated access-log middleware |
| Audit / API / webhook logs | DB entities + admin APIs |
| Container logs | Docker stdout — no centralized aggregation |
| Log retention policy | Undefined |

**Gap:** No ELK/Loki/CloudWatch Logs shipping. Acceptable for single-node EC2; insufficient for multi-instance.

---

## 10. Backups & Restore

### 10.1 Application layer

| API | Implementation | Real backup? |
|-----|----------------|--------------|
| `POST /backup` | `DataJobService.startBackup` → export queue | Partial — queues job |
| `GET /backup/history` | DB history | OK |
| `POST /backup/:id/restore` | Queues restore | Partial |
| `POST /admin/backups` | `AdminBackupsService` | **Stub** — returns fake data |
| `POST /admin/restore` | `AdminRestoreService` | **Stub** — no actual restore |

### 10.2 Infrastructure layer

| Item | Status |
|------|--------|
| Postgres `pg_dump` automation | **Missing** |
| MinIO bucket replication | Missing |
| Redis RDB/AOF persistence | Default (AOF off) — data loss risk on crash |
| Qdrant snapshot schedule | Missing |
| S3 off-site backup | State bucket only (Terraform/deploy configs) |
| Restore runbook | Missing |
| RTO/RPO defined | Missing |

### 10.3 Recommended DR procedures (manual until automated)

```bash
# Postgres backup (on EC2 host)
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U root autopilot_monster | gzip > backup-$(date +%F).sql.gz

# Restore Postgres
gunzip -c backup-YYYY-MM-DD.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U root autopilot_monster

# MinIO — use mc mirror or AWS S3 sync if migrated to S3
# Qdrant — POST /collections/{name}/snapshots (API) or volume snapshot
```

---

## 11. Disaster Recovery

| Scenario | Current capability | Gap |
|----------|-------------------|-----|
| EC2 instance loss | Redeploy via GitHub Actions + Terraform | Manual; no AMIs |
| Postgres corruption | Volume on same host | No off-site dumps |
| Redis failure | Cache/queue loss | Enable AOF or accept loss |
| MinIO data loss | Local volume | No replication |
| Region outage (ap-south-1) | Single region | No multi-region |
| Secret compromise | Rotate via S3 env file | No Secrets Manager |

**DR maturity: Level 1 (ad-hoc)** — redeploy possible; data recovery not guaranteed.

---

## 12. Critical Issues — Fixed This Audit

| # | Issue | Fix |
|---|-------|-----|
| C1 | MinIO disabled in dev compose | Enabled MinIO + env wiring |
| C2 | Prod compose missing Postgres | Added Postgres 15 + volume |
| C3 | Prod compose missing MinIO | Added MinIO + volume |
| C4 | Prod seed on every container start | Dockerfile uses `node dist/main`; prestart gated to non-production |
| C5 | Deploy workflow fails on missing `.env.production` | Conditional S3 sync + `.env.production.example` |
| C6 | No Docker healthchecks (API, Redis, deps) | Added across dev/prod compose + Dockerfile |
| C7 | Readiness ignored Redis/MinIO/Qdrant | Extended `health.controller.ts` |
| C8 | `DB_SYNCHRONIZE=true` in dev compose | Default `false` via env override |

---

## 13. Remaining Recommendations (Priority Order)

1. **Upload production secrets** to S3 (`deploy/backend/.env.production`) before deploy.
2. **Automate Postgres backups** — cron on EC2 or AWS Backup; store in S3 with 30-day retention.
3. **Enable Redis AOF** for queue durability: `redis-server --appendonly yes --requirepass ...`
4. **Add Prometheus `/metrics`** (TASK-033) and Grafana or CloudWatch dashboard.
5. **Implement real `AdminBackupsService`** — wire to `pg_dump` + MinIO upload.
6. **CI:** run migrations + add Qdrant service for RAG integration tests.
7. **CI security:** add `npm audit`, CodeQL, or Trivy image scan.
8. **Align DB names** in `.env.example` vs compose.
9. **Tune Sentry sample rates** for production cost control.
10. **Document RTO/RPO** and test restore quarterly.

---

## 14. Verification Checklist

```bash
# Local stack
docker compose up -d
curl -sf http://localhost:8000/api/v1/health/ready | jq .
curl -sf http://localhost:8000/api/v1/health | jq .

# Service health
docker compose ps   # all services healthy

# Prod compose validation (dry)
docker compose -f docker-compose.prod.yml config
```

---

## 15. Files Modified in This Audit

| File | Change |
|------|--------|
| `docker-compose.yml` | MinIO, Qdrant, healthchecks, env fixes |
| `docker-compose.prod.yml` | Postgres, MinIO, healthchecks, optional env_file |
| `backend/Dockerfile` | HEALTHCHECK, direct node start |
| `backend/package.json` | Production-safe prestart gate |
| `backend/src/health/health.controller.ts` | Redis/MinIO/Qdrant readiness |
| `.github/workflows/deploy.yml` | Conditional `.env.production` sync |
| `backend/.env.production.example` | **New** — deploy secret template |
| `nginx/nginx.conf` | Health endpoint without rate limit |

---

*End of infrastructure audit.*
