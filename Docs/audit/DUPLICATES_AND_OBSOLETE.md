# Duplicates and Obsolete Artifacts

**Audit date:** 2026-07-22

---

## Duplicate implementations

| Item | Locations | Risk | Recommendation |
|------|-----------|------|----------------|
| Auth stack | `backend/src/modules/auth/*` (canonical) vs root `src/auth.module.ts`, `src/auth.controller.ts`, `src/auth.service.ts`, `src/strategies/*`, `src/guards/*`, `src/entities/*` | Confusion; accidental compile inclusion | Delete obsolete root auth tree after confirming unused |
| Marketplace | `PlatformModule` marketplace/plugins vs `modules/marketplace/marketplace.module.ts` (templates, **unwired**) | Split brain APIs | Wire templates into Platform **or** delete orphan module |
| WhatsApp broadcast routes | `WhatsappController` + unwired `BroadcastController` | Duplicate paths if both mounted | Keep one controller |
| Voice campaigns | `VoiceController` + unwired `VoiceCampaignController` | Same | Keep one |
| Analytics | Wired analytics controllers vs unwired `AdvancedAnalyticsController` on same `analytics` prefix | Collision if mounted | Finish advanced **or** remove |
| Billing surfaces | `billing` + `monetization` controllers; admin billing overlap | Dual APIs | Document single public surface |
| Developer / API keys | `DeveloperModule` (unwired) vs `tenant-settings/developer-settings.controller` + `tenant/api-key.controller` | Overlapping settings | Unify under one module |
| CRM UIs | `(app)/crm/*` (~74 pages) vs `admin/crm/*` (~27) | Drift; admin fetch broken | Prefer app services; fix admin to use axios client |
| Search UIs | Mock `(app)/search` vs wired `admin/crm/search` | User confusion | Wire tenant search to `SearchService` |
| Toast libs | `sonner` + `react-hot-toast` | Bundle noise | Standardize on one |
| Queue stacks | `@nestjs/bull` + `@nestjs/bullmq`; names `workflow` vs `workflows` | Silent job loss | Single stack + one queue name |
| Postgres in prod compose | Services `postgres` and `db` share `pg_prod_data` | Data corruption | Keep one service; fix `DATABASE_URL` |

---

## Obsolete / aspirational docs vs code

| Claim | Reality | Evidence |
|-------|---------|----------|
| README: Next 14 / Nest 10 / Fargate / RDS / Vercel | Next **16**, Nest **11**, Terraform **EC2**, compose MinIO/Qdrant on box | `README.md`, `package.json`, `main.tf` |
| README root `.env.example` | **Missing** | root listing |
| Docs HLD/LLD `apps/core\|auth\|ui` | Flat `backend/` + `frontend/` | `Docs/HLD.md`, `Docs/LLD.md` |
| Frontend README standalone Docker | No `output: 'standalone'` in `next.config.mjs` | `frontend/Dockerfile`, config |
| `tasks/TASKS.md` many “completed” phases | Audit finds stubs, unwired modules, mock hubs | Inventory statuses |
| Deleted Docs/scripts/project-audit (prior merge) | Intentional purge — do not treat as feature completeness | git history `TASK-036` |

---

## Orphan / dead code files

| Path | Notes |
|------|-------|
| `backend/src/index 2.ts` | Orphan filename |
| Compiled `*.d.ts` next to sources under `backend/src/strategies/` etc. | Build artifact noise |
| `frontend/src/components/ui/page-placeholder.tsx` | Unused |
| `@tanstack/react-query` provider | Installed; **0** `useQuery` usages |
| Razorpay/PayPal stub services | Not registered in MonetizationModule |
| Omnichannel stub | Unwired |

---

## Dead links (FE)

| Link | Referenced from | Status |
|------|-----------------|--------|
| `/billing/plans` | `components/layout/sidebar.tsx` | No page |
| `/settings/data` | `(app)/settings/page.tsx` | No page |
| `/inbox/conversations` (list) | inbox page | Only `[id]` exists |
| `/admin/whatsapp/{inbox,templates,settings}` | `admin/whatsapp/page.tsx` | No pages |

---

## Env / config contradictions

| Conflict | Detail |
|----------|--------|
| Local compose DB | `autopilot_monster` / user `root` |
| `backend/.env.example` | `autopilot_crm` / `autopilot` |
| `.env.production` | `DATABASE_URL` host `db` while compose also defines `postgres` |
| CI Redis | No password; local compose uses password |
| Next rewrite | `NEXT_PUBLIC_API_URL` already ends `/api/v1` + rewrite `/api/:path*` → double prefix risk for raw fetches |
