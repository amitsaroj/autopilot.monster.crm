# Agent 05 — CRM Backend Hardening

**Date:** 2026-07-22  
**Wave:** High-priority CRM Backend (BL-H01, BL-H02, BL-H07)  
**Status:** Partial complete — core write validation + merge wiring + opt-in pagination shipped

---

## Endpoints improved

### Validation DTOs (replaced `@Body() any` / unvalidated Partial)

| Area | Endpoints |
|------|-----------|
| Contacts | create/update/merge |
| Companies | create/update/merge |
| Deals | create/update |
| Leads | create/update/bulk `{ leads }` / convert |
| Tasks | create/update |
| Notes / Activities | create |
| Products / Quotes | create/update |
| Pipelines / stages | create/update/createStage |
| Campaigns | create/update/start |
| Tags / Segments / Custom fields | create (+ custom field update) |
| Bulk | status / delete / import |
| Email | send |

Remaining `@Body() any`: AI `agents` + `flows` only (out of core CRM entity scope).

### Duplicate merge (F-020 / BL-H07)

- Wired `DuplicateController` + `DuplicateDetectionService` into `CrmModule`
- Routes: `GET /crm/duplicates`, `POST /crm/duplicates/check`, `POST /crm/duplicates/merge`
- Merge delegates to `ContactService.mergeContacts` (reassigns activities/notes/deals; soft-deletes secondary)
- Added `POST /crm/companies/merge` with child reassignment + hard delete secondary
- `@ResourcePermissions('crm')` + `@Roles` on duplicate controller

### Pagination / filters / search (F-062 / BL-H01)

Opt-in on list endpoints (legacy array response when no `page`/`limit`/`search`/`status` filters — FE compatible):

- `GET /crm/contacts|companies|leads|deals|tasks|products|quotes`
- Query: `CrmListQueryDto` (`page`, `limit`, `search`, `status`, `pipelineId`, `companyId`)
- Shape when paginated: `{ data, meta }` via `toPaginatedResult`

### Permissions

- CRM already had global `RolesGuard` + `PermissionGuard` + `@ResourcePermissions('crm')`
- Duplicate endpoints now inherit same CRM resource permissions
- No audit write hooks (Security BL-C01 still broken — skipped per instructions)

### Broken inventory fixes

- Product DTO uses entity field `price` (was wrongly documented as `unitPrice` in e2e)
- Company delete uses hard delete (Company entity lacks soft-delete column)
- Contact self-merge now `400 BadRequest` instead of `404`

---

## Tests run

| Suite | Result |
|-------|--------|
| `tsc --noEmit` | Pass |
| Unit: `contact-merge.service.spec`, `deal.service.spec`, `forecast.service.spec` | **8/8 pass** |
| Integration: `crm-*-http` (crud/companies/products/leads/deals) | **Fail — pre-existing** `TwilioModule` missing `VoiceCallRepository` DI + pg auth noise; not introduced by this wave |

---

## Remaining CRM gaps (ranked)

1. **P0** — Fix Nest test app DI for Twilio/Voice so CRM e2e suite can run again  
2. **P1** — FE consumers for pagination (`?page=&limit=`) + duplicate merge UI  
3. **P1** — Agent/Flow write DTOs (still `any`)  
4. **P2** — Always-on paginated list contract (drop legacy full-array mode) once FE updated  
5. **P2** — CRM audit emitters after Security fixes BL-C01 (`audit.log` + TypeORM `AuditLog`)  
6. **P2** — Deeper company duplicate detection (domain/name similarity) beyond merge API  
7. **P3** — Quote number auto-generation; activity/task list query-builder search (current search path loads all for some entities)  
8. **P3** — Bulk lead import still loosely typed payload rows (`Record<string, unknown>[]`)

---

## Matrix deltas (judgment)

| ID | Before % | After % | Notes |
|----|---------:|--------:|-------|
| F-010 Contacts | 68 | ~75 | DTO/Val + merge + opt-in page |
| F-011 Companies | 62 | ~72 | DTO + company merge |
| F-012 Leads | 65 | ~72 | DTO + page/search |
| F-013 Deals | 64 | ~72 | DTO + page/filters |
| F-014 Pipelines | 60 | ~68 | Stage/pipeline DTOs |
| F-016 Products | 58 | ~68 | Validated price DTO |
| F-017 Quotes | 62 | ~70 | Validated write DTOs + page |
| F-018 Tasks/notes | 55 | ~65 | Task/note/activity DTOs |
| F-020 Duplicate merge | 20 | ~55 | Wired API; no FE |
| F-062 List pagination | 15 | ~40 | Opt-in BE only; no FE UX |

Still **not ✅ Complete** under full DoD (audit write dead, FE pagination UX missing, e2e harness broken).
