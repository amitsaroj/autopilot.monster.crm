# Agent 02 — Frontend Core

**Date:** 2026-07-22  
**Scope:** BL-C04, BL-C05, BL-C07 (coord), BL-H03  
**Commit/push:** none

---

## Pages fixed

| Page | Change | APIs |
|------|--------|------|
| `(app)/dashboard` | Removed hardcoded KPIs; loading/error/empty | `GET /analytics/overview`, `/analytics/pipeline`, `/analytics/revenue`, `/crm/activities`, `/crm/tasks` |
| `(app)/inbox` | Real conversations; WA fallback | `GET /omnichannel/conversations` → fallback `GET /whatsapp/conversations` |
| `(app)/search` | Live search + filters | `GET /search?q=&types=` |
| `(app)/import` | History + upload start job | `GET /import/history`, `POST /storage/files/upload`, `POST /import` |
| `(app)/export` | History + start export/backup | `GET /export/history`, `POST /export`, `POST /backup` |
| `admin/page` | KPIs map to real overview fields (no fake trends) | `GET /analytics/overview` (already on shared `api`) |
| `admin/billing` | Nested `data` parse for subscription/portal | `/monetization/subscription`, `/usage/all`, `POST /portal` |

## Backend unblock (minimal)

- Registered `OmnichannelController` + `OmnichannelService` + `Conversation`/`Message` in `crm.module.ts`
- Omnichannel `getConversations` loads `contact` relation

## Services added/updated

- **New:** `analytics.service.ts`, `omnichannel.service.ts`
- **Fixed:** `search.service.ts` (BE returns `{ results }`, not `{ data }`)
- **Paths:** `admin-email-settings` → `/admin/settings/email`; `admin-system-settings` → `/admin/settings/system`
- `userService.getGroups`; `campaignService.getCampaigns({ type })`

## BL-C07 admin unauth fetch

Already migrated to shared `api` client (Security agent overlap). No remaining `fetch('/api/v1/...')` under `admin/` or `superadmin/`.

## Remaining mock / broken UI (out of wave or blocked)

| Item | Status |
|------|--------|
| `(app)/ai` mock usage KPIs | Still mock (F-029) |
| `admin/rbac` fake stats | BL-C11 / Security |
| Dead nav `/billing/plans`, `/settings/data`, admin WA children | BL-H14 not done |
| `/users/groups` BE route `:id` shadows `groups` | **Blocked by BL-C06** (FE calls correct path) |
| Omnichannel send/route still stubby | Partial — list works; channel send is stub |
| Search index limited to contacts/deals/companies | BE capability; no leads/files/workflows |
| FE automated tests | Still **0** (BL-C10) — gap noted, not added |

## FE test gap

No frontend test suite added (per wave rules). BL-C10 remains open.

## DoD

Not marking F-021/F-022/F-037/F-041 ✅ — need runtime evidence + E2E; still Partial/Broken → improved wiring only.
