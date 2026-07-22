# Agent 04 — Authentication & Security / Platform

**Date:** 2026-07-22  
**Wave:** Critical Security & Platform fixes (BL-C01, C03, C06, C07 + partial C11/C12)

## Completed

### BL-C01 — Audit log write path
- Registered `AuditLog` in `PlatformModule` `TypeOrmModule.forFeature`
- Added `AuditLogListener` bridging domain events → `AuditLogService.log`
- Wired emitters for auth events (existing), tenant lifecycle (existing), user invite/update, RBAC role create/update/assign/revoke
- Added `EVENT_NAMES.AUDIT_LOG` / RBAC / user invite-update constants
- Fixed read route to `GET /logs/audit` with standard response envelope

### BL-C03 — Secrets hygiene
- `git rm --cached` for `backend/.env.production`, `frontend/.env`, `frontend/.env.production` (staged untrack; **not committed**)
- Added `backend/.env.production.example`, `frontend/.env.production.example`, root `.env.example`
- Strengthened `.gitignore` (`!.env.*.example` + explicit backend/frontend env paths)
- Scrubbed local env copies to placeholders; `DB_SYNCHRONIZE=false` in production example
- Production JWT guidance documents RS256 keys (code already enforces RS256 in prod)

### BL-C06 — Users groups route order
- Reordered `users.controller.ts`: static `groups` / `invite` / `me` before `:id`

### BL-C07 — Admin unauthenticated fetch
- Migrated 33 admin/superadmin pages from `fetch('/api/v1/...')` to authenticated `api` axios client

### Partial domain extras
- Removed misleading RolesGuard “stub” comment (BL-C11 note)
- Confirmed JWT RS256 production enforcement already in `jwt.config.ts` (BL-C12 largely done in code)

## Test / build results
- Backend `nest build`: **PASS**
- Jest (`permission.guard|jwt-signing|tenant-isolation|auth.integration|rbac-http`): **8 passed / 2 suites**
- Frontend `next build`: **PASS** (also fixed missing analytics service exports blocking FE typecheck)

## Remaining security gaps
- BL-C11 RBAC FE hubs still partially fake; PermissionGuard vs resource-level depth needs product QA
- BL-C12: ensure real RS256 key material in deployed secrets (not in git); refresh tokens still HS256 by design
- Audit coverage does not yet include every CRM mutation (contact/deal) — security-sensitive path covered first
- Rate-limit admin settings exist; global throttler already mounted — no change this wave
- Secrets still exist in git **history** until a history rewrite / rotation (out of scope; do not force-push)

## Not committed / not pushed
Per instructions.
