# Autopilot Monster — Task Ledger

Historical implementation-candidate ledger. The baseline and task statuses below were last recorded on
2026-10-14 and have not been reconciled against the current `main` branch. Do not use them as current
ownership, completion, release, or security status. `docs/implementation-status.md` is the maintained
verification snapshot; re-audit a row before acting on it. The duplicate `Docs/tasks/TASKS.md` has been
removed.

Status values: `TODO` · `IN_PROGRESS` · `DONE_UNVERIFIED` (code + unit tests, no real-provider/E2E proof) ·
`VERIFIED` (passing evidence recorded) · `BLOCKED` (needs owner action/credentials).

Priority: P0 = security/data-loss/revenue blocker · P1 = WhatsApp MVP · P2 = commercial readiness · P3 = hardening.

## Baseline — 2026-10-14 (branch `fix/pipeline-ci`, commit `3beaae3`)

| Command | Exit | Notes |
|---|---|---|
| backend `npm run typecheck` | 0 | |
| backend `npm run lint:check` | 0 | |
| backend `npm test` | 0 | unit suites only; integration specs not run in baseline |
| backend `npm run build` | 0 | |
| backend `npm audit --omit=dev` | 1 | 53 vulns (1 critical `proxy-addr` IP spoofing, 24 high) |
| frontend `npm run typecheck` | 0 | |
| frontend `npm run lint:check` | 0 | warnings only (unused vars) |
| frontend `npm test -- --run` | 0 | 8 files, 37 tests |
| frontend `npm run build` | 0 | |
| frontend `npm audit --omit=dev` | 1 | 30 vulns (1 critical, 11 high) |
| prettier check (both) | 1 | only untracked generated `frontend/next-env.d.ts`; now ignored |

## Tasks

| ID | P | Module | Task | Owner | Deps | Status | Evidence / blocker |
|---|---|---|---|---|---|---|---|
| AM-001 | P0 | Security | Tenant self-upgrade via PATCH tenant/sub-admin settings (planId/overrides/status) (F2) | security-agent | | IN_PROGRESS | |
| AM-002 | P0 | Security | Body `tenantId` overwrite moves rows cross-tenant (F3); untyped bodies skip validation (F1) | security-agent | | IN_PROGRESS | remaining `any`-body sites → AM-040 |
| AM-003 | P0 | Security | RBAC escalation to `admin:*` / ADMIN; admin tenant-settings open to ADMIN (F4) | security-agent | | IN_PROGRESS | |
| AM-004 | P0 | Security | OAuth authorize-details leaks other tenants' client secrets (F5) | security-agent | | IN_PROGRESS | |
| AM-005 | P0 | Security | SSRF: KB crawl, voice URLs, developer-settings test webhook (F6, F8) | security-agent | | IN_PROGRESS | |
| AM-006 | P0 | Security | SSRF: workflow CALL_WEBHOOK templated URLs / redirects (F7) | cleanup-agent | | IN_PROGRESS | |
| AM-007 | P0 | Security | Login rate limit bypass via rotating `x-tenant-id` (F9) | security-agent | | IN_PROGRESS | Redis throttler storage TBD |
| AM-008 | P1 | Security | Reset/verify tokens persisted in audit log; refresh-token `typ` + reuse detection; MFA disable w/o re-auth (F11–F13) | security-agent | | IN_PROGRESS | |
| AM-009 | P1 | Security | Marketplace template IDOR; unsigned IVR callback; account enumeration (F14, F20, F10) | security-agent | | IN_PROGRESS | |
| AM-010 | P0 | WhatsApp | Remove/lock insecure legacy settings modules (sub-admin profiles, admin whatsapp-settings plaintext secrets) | cleanup-agent | | IN_PROGRESS | |
| AM-011 | P0 | DevOps | Migrations 018/020 fail or no-op on fresh DB; they import the live registry | cleanup-agent | | IN_PROGRESS | |
| AM-012 | P1 | WhatsApp | Durable webhook inbox table, replay, template-status/quality/account_update handling | webhook-agent | | IN_PROGRESS | |
| AM-013 | P1 | WhatsApp | Outbound reconciliation: buffer early status events, sweep stuck SENDING/UNKNOWN, manual reconcile | webhook-agent | AM-012 | IN_PROGRESS | |
| AM-014 | P1 | WhatsApp | Real WhatsApp test suite; fix stale integration spec that silently skips | webhook-agent | | IN_PROGRESS | |
| AM-015 | P1 | WhatsApp | Broadcast: no locks during HTTP, per-number rate limit, Meta error-code map (131050 suppress), UNKNOWN not retried, retry failed | broadcast-agent | | IN_PROGRESS | |
| AM-016 | P1 | WhatsApp | Embedded Signup, subscribed_apps, health diagnostics, token key rotation | onboarding-agent | | IN_PROGRESS | real Meta app verification BLOCKED on credentials |
| AM-017 | P1 | WhatsApp | Conversations table keyed (tenant, phone_number_id, phone); paginated inbox; SQL analytics | — | AM-012, AM-013 | TODO | in-memory full-table load today |
| AM-018 | P2 | WhatsApp | Per-message pricing capture → cost analytics → overage billing | webhook-agent (capture) | AM-012 | IN_PROGRESS | |
| AM-019 | P1 | Workflow | Builder cannot create condition branches (publish fails) | cleanup-agent | | IN_PROGRESS | |
| AM-020 | P2 | Workflow | LEAD_CREATED trigger has no listener; one bad flow aborts trigger loop; worker concurrency 1 | cleanup-agent | | IN_PROGRESS | |
| AM-021 | P1 | Billing UI | /billing upgrade+portal always fail, /billing/invoices always empty (response unwrap); marketing prices ≠ DB plans | billing-agent | | IN_PROGRESS | /settings/security crash still TODO |
| AM-041 | P0 | Billing | New signups have no subscription → PlanGuard blocks CRM and even the upgrade route | billing-agent | auth.service change via security-agent | IN_PROGRESS | |
| AM-042 | P0 | Billing | Contact/deal limits never enforced (guard reads MONTHLY, meter writes TOTAL); guard fails open; non-atomic usage writes | billing-agent | | IN_PROGRESS | |
| AM-043 | P1 | Billing | Upgrade opens a 2nd Stripe subscription; webhooks not idempotent/ordered; planId not synced; no trial expiry / dunning grace | billing-agent | | IN_PROGRESS | real Stripe test-mode verification BLOCKED on keys |
| AM-044 | P1 | CRM | Lead create 400 / update 404; pipeline delete 404; timeline shows all activity; 4 failing CRM integration suites | crm-agent | | IN_PROGRESS | baseline: 13/17 CRM+billing integration suites pass |
| AM-045 | P2 | CRM | Tag assignment, segment evaluation, custom-field validation, bulk-delete RBAC, import validation, CSV export | crm-agent | | IN_PROGRESS | |
| AM-046 | P2 | CRM | Fabricated company edit page, hardcoded trends, dead buttons, CRM email "send" never sends | crm-agent | | IN_PROGRESS | |
| AM-022 | P1 | Onboarding | Onboarding flow unreachable after register; drops industry/role | — | | TODO | |
| AM-023 | P0 | DevOps | Prod DB/Redis/MinIO on default passwords (host .env lacks secrets) | owner | | BLOCKED | needs AWS/GitHub secrets access |
| AM-024 | P0 | DevOps | Rotate secrets leaked in git history (`f0bc080`, `aeb24db`) and purge history | owner | | BLOCKED | needs owner; history rewrite is destructive |
| AM-025 | P1 | DevOps | Deploy: `set -e` on SSM steps, gate on CI, SHA-tagged images for rollback | — | | TODO | |
| AM-026 | P1 | DevOps | Backups: EBS snapshot policy + nightly pg_dump to S3 + restore test | — | | TODO | needs AWS apply → owner |
| AM-027 | P1 | DevOps | `PUBLISH_OPENAPI=true` in prod exposes Swagger | — | | TODO | |
| AM-028 | P2 | DevOps | CI: lint step, run migrations with synchronize off, PG 15 parity; Dockerfile `USER node` + `npm ci` | — | | TODO | |
| AM-029 | P1 | Deps | `npm audit fix` (non-breaking) both apps; critical `proxy-addr` | — | after agents finish | TODO | |
| AM-030 | P2 | AI | Central quota + metering in AiProviderService; realtime voice bypasses adapter; lead-intel unmetered | — | | TODO | |
| AM-031 | P2 | Scheduler | Tenant scheduler is a no-op and fires per replica; social cron double-posts | — | | TODO | |
| AM-032 | P2 | AI | KB delete leaves vectors; ingestion over-reports chunks | — | | TODO | |
| AM-033 | P2 | Frontend | 10 MOCK admin/superadmin pages; standardise on `parseApiData` | — | | TODO | |
| AM-034 | P2 | Security | Refresh token → HttpOnly cookie; global upload size limits (F15, F16) | — | AM-008 | TODO | |
| AM-035 | P3 | Infra | Terraform: IMDSv2, encrypted EBS, scoped S3, no SG ignore_changes, state lock, OIDC | — | | TODO | owner apply |
| AM-036 | P3 | Docs | Merge duplicate `Docs/` tree into canonical lowercase `docs/`; remove stale scorecards and agent reports; repair links | — | | VERIFIED | 2026-10-16: migrated unique CRM/security/operations guidance, updated canonical docs/index and removed superseded reports |
| AM-040 | P1 | Security | Convert remaining `any`/`Partial`/`Record` request bodies to DTOs; then make ValidationPipe reject untyped bodies | — | AM-002 | TODO | |
