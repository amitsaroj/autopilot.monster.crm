# Agent 13 — Infrastructure Specialist

**Date:** 2026-07-22  
**Scope:** BL-C02 (prod compose/TLS), health checks, queue workers in compose, CI deploy UI gap, Redis/MinIO/Qdrant env consistency  
**Commit/push:** none

---

## Files changed

| File | Change |
|------|--------|
| `docker-compose.prod.yml` | Removed duplicate `db` Postgres; added `ui`, `ssl-init`; forced single-DB + MinIO/Redis/Qdrant env; healthchecks |
| `docker-compose.yml` | UI healthcheck + `depends_on: api` healthy |
| `nginx/nginx.conf` | Enabled HTTPS; routes `/api/` → api, `/` → ui; ACME + HTTP→HTTPS |
| `nginx/ssl/.gitkeep` | Demo/self-signed cert mount dir |
| `certbot/conf/.gitkeep`, `certbot/www/.gitkeep` | Certbot volume dirs |
| `.github/workflows/deploy.yml` | Build/push `ui` image; create `nginx/ssl` on host; write DOMAIN/API URL into deploy `.env` |
| `backend/.env.example` | Align DB/Redis/MinIO/Qdrant with compose; add SMTP; `DB_SYNCHRONIZE=false` default |
| `backend/.env.production.example` | New placeholder prod template (no real secrets) |
| `backend/.env.production` | Removed `DATABASE_URL`→`db`; MinIO→compose `minio`; `DB_SYNCHRONIZE=false` |
| `.env.example` | New root compose defaults |
| `.gitignore` | Allow `*.env.production.example`; ignore generated SSL/certbot material |
| `project-audit/CHECKPOINT.md` | This wave resume notes |
| `project-audit/agents/13-infrastructure.md` | This report |

---

## Compose architecture — before / after

### Before (broken)

```
nginx (HTTP only, API-only proxy; TLS commented)
postgres  ──┐
db        ──┴── same volume pg_prod_data (dual Postgres race)
api → env DATABASE_URL host=`db` (orphan) OR DB_HOST=postgres (conflict)
redis, minio, qdrant, certbot
(no ui)
```

### After (demo/prod-ready skeleton)

```
ssl-init → self-signed certs in ./nginx/ssl (if missing)
nginx :80/:443 → HTTPS; /api/* → api:8000; /* → ui:3000; ACME on :80
postgres (single) + redis + minio + qdrant
api (GHCR) — health /api/v1/health/ready; DB/Redis/MinIO/Qdrant forced in-network
ui (GHCR) — health GET /
certbot renew loop syncs LE certs into nginx/ssl when present
```

Queue processors (WhatsApp, import/export, workflow) run **in-process** with the API. No separate worker binary/image exists — **not** added as fake compose services (BL-C08 remains an application gap for Workflow/Platform).

---

## Remaining infra risks

1. **Tracked secrets** — `backend/.env.production` / `frontend/.env` still in VCS with dummy-but-sensitive values (BL-C03 / Security).
2. **Self-signed TLS** — browsers warn until real Let's Encrypt certs are issued and synced into `nginx/ssl`.
3. **GHCR images** — local `compose up` needs built/pushed `api`+`ui` or override `build:`.
4. **Frontend Dockerfile** — not Next standalone; larger image / cold start (BL-M09).
5. **Terraform** — still single-EC2 stub vs README Fargate/RDS (BL-H10); untouched.
6. **Deploy SSM** — still fire-and-forget (no wait/poll success) (BL-H09 partial).
7. **Missing queue processors** — email/sms/voice/billing/analytics/search-index have no workers in code (BL-C08).
8. **Workflow queue name** — BullMQ `'workflows'` vs `QUEUE_NAMES.WORKFLOW='workflow'` (Workflow agent).
9. **CI Redis** — CI redis has no password while app may expect one in non-test; existing CI sets `REDIS_PASSWORD=""`.

---

## How to validate locally

```bash
# 1) Config sanity (no pull required)
cp .env.example .env   # set GITHUB_REPOSITORY if pulling images
docker compose -f docker-compose.prod.yml config --services
# expect: ssl-init postgres redis minio qdrant api ui nginx certbot  (no `db`)

# 2) Local full stack (build from source)
docker compose up -d --build
docker compose ps
curl -sf http://localhost:8000/api/v1/health/ready
curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:3000/

# 3) Prod-shaped stack (needs images, or temporarily add build: blocks)
# Build & tag locally then retag to match compose image names, or:
docker build -t ghcr.io/${GITHUB_REPOSITORY:-owner/autopilots.monster.crm}/api:latest ./backend
docker build --build-arg NEXT_PUBLIC_API_URL=https://localhost/api/v1 \
  -t ghcr.io/${GITHUB_REPOSITORY:-owner/autopilots.monster.crm}/ui:latest ./frontend
docker compose -f docker-compose.prod.yml up -d
curl -k -sf https://localhost/api/v1/health/ready
curl -k -sf -o /dev/null -w '%{http_code}\n' https://localhost/

# 4) Confirm dual Postgres gone
docker compose -f docker-compose.prod.yml ps | grep -E 'postgres|db' 
# only autopilot_postgres
```

---

## Backlog impact

| ID | Status after this wave |
|----|------------------------|
| BL-C02 / F-056 | ⚫ → 🟡 Partial (coherent compose + TLS path; LE cutover + image supply still ops) |
| BL-C08 | Unchanged (code processors missing; not a compose omission) |
| BL-H09 | Partial — deploy now builds UI; SSM wait still open |
| BL-H11 | Partial — SMTP documented in `.env.example` |
| BL-H10 | Unchanged (Terraform) |
