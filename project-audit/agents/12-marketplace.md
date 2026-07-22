# Agent 12 — Marketplace + Developer Platform

**Date:** 2026-07-22  
**Scope:** F-035 marketplace templates orphan · F-046 DeveloperModule unwired (partial Agent 1)  
**Commit/push:** none

---

## Files changed

| File | Change |
|------|--------|
| `backend/src/app.module.ts` | Import `DeveloperModule` in CoreModule |
| `backend/src/modules/platform.module.ts` | Import `MarketplaceModule`; remove inline `MarketplaceController`/`MarketplaceService` |
| `backend/src/modules/marketplace/marketplace-template.controller.ts` | `@ResourcePermissions('marketplace')`, `@Roles` on writes, `@Public` on browse, DTO validation |
| `backend/src/modules/marketplace/marketplace-template.dto.ts` | **New** — `CreateMarketplaceTemplateDto`, `UpdateMarketplaceTemplateDto` |
| `backend/src/modules/developer/webhook.controller.ts` | `@ResourcePermissions('settings')`, `@Roles('TENANT_ADMIN')`, reuse webhook DTOs |
| `backend/src/modules/developer/oauth.controller.ts` | `@ResourcePermissions('settings')`, `@Roles('TENANT_ADMIN')` on app create, `CreateOAuthAppDto` |
| `backend/src/modules/developer/api-log.controller.ts` | `@ResourcePermissions('settings')`, `@Roles('TENANT_ADMIN')` |
| `backend/test/integration/marketplace-templates-http.integration.spec.ts` | **New** — 3 tests |
| `backend/test/integration/developer-http.integration.spec.ts` | **New** — 5 tests |
| `project-audit/CHECKPOINT.md` | Reclassify F-035, F-046 |
| `project-audit/agents/12-marketplace.md` | This report |

---

## F-046 — DeveloperModule wired

| Item | Detail |
|------|--------|
| Was | `DeveloperModule` absent from `app.module.ts`; FE `developer.service.ts` unreachable |
| Fix | `DeveloperModule` imported in `CoreModule` (`app.module.ts`) |
| Routes live | `/api/v1/developer/webhooks/*`, `/api/v1/developer/oauth/*`, `/api/v1/developer/logs/*` |
| Permissions | `@ResourcePermissions('settings')` + `@Roles('TENANT_ADMIN')` on write/read paths |
| Validation | Reused `CreateWebhookDto` / `UpdateWebhookDto` / `CreateOAuthAppDto` from tenant-settings |
| FE | `frontend/src/services/developer.service.ts` now maps to live APIs; settings page uses overlapping `developer-settings.service.ts` under `/settings/*` (intentional dual surface — see DUPLICATES doc) |

### Developer API surface

```
POST   /api/v1/developer/webhooks
GET    /api/v1/developer/webhooks
GET    /api/v1/developer/webhooks/:id
PATCH  /api/v1/developer/webhooks/:id
DELETE /api/v1/developer/webhooks/:id
POST   /api/v1/developer/webhooks/:id/test
POST   /api/v1/developer/webhooks/:id/rotate-secret
GET    /api/v1/developer/webhooks/:id/deliveries

POST   /api/v1/developer/oauth/apps
GET    /api/v1/developer/oauth/apps
GET    /api/v1/developer/oauth/apps/:id
DELETE /api/v1/developer/oauth/apps/:id
GET    /api/v1/developer/oauth/authorize-details
POST   /api/v1/developer/oauth/authorize
POST   /api/v1/developer/oauth/token          (@Public)

GET    /api/v1/developer/logs
GET    /api/v1/developer/logs/stats
```

---

## F-035 — Marketplace templates wired

| Item | Detail |
|------|--------|
| Was | `MarketplaceModule` (with `MarketplaceTemplateController`) not imported; only inline `MarketplaceController` in `PlatformModule` |
| Fix | `PlatformModule` imports full `MarketplaceModule` (apps + templates) |
| Routes live | `/api/v1/marketplace/templates/*` |
| Permissions | `@ResourcePermissions('marketplace')`; `@Roles('TENANT_ADMIN','SUPER_ADMIN')` on create/publish/update/delete |
| Browse | `GET /marketplace/templates` and `GET /marketplace/templates/:id` are `@Public` (published only) |
| FE | No dedicated templates page; tenant marketplace hub at `(app)/marketplace/*` uses plugin APIs only — templates API ready for future UI |

### Template API surface

```
GET    /api/v1/marketplace/templates              (@Public — published)
GET    /api/v1/marketplace/templates/:id          (@Public)
POST   /api/v1/marketplace/templates              (auth + admin)
PATCH  /api/v1/marketplace/templates/:id          (auth + admin)
DELETE /api/v1/marketplace/templates/:id          (auth + admin)
POST   /api/v1/marketplace/templates/:id/install  (auth)
POST   /api/v1/marketplace/templates/:id/publish  (auth + admin)
```

Existing marketplace plugin routes unchanged via `MarketplaceModule`:

```
GET    /api/v1/marketplace
GET    /api/v1/marketplace/installed
GET    /api/v1/marketplace/apps
GET    /api/v1/marketplace/:id
POST   /api/v1/marketplace/:id/install
...
```

---

## Test results

```
npm run build                                          → PASS
npm run test:integration -- --testPathPatterns="marketplace|developer"
  marketplace-http.integration.spec.ts                 → 4/4 PASS
  marketplace-templates-http.integration.spec.ts       → 3/3 PASS
  developer-http.integration.spec.ts                   → 5/5 PASS
  Total                                                → 12/12 PASS
```

---

## Reclassification

| ID | Before | After | Evidence |
|----|--------|-------|----------|
| F-046 | ⚫ Broken | 🟡 Partial | Module mounted; APIs live; dual dev surface with `/settings/*` not unified |
| F-035 | ⚫ Broken | 🟡 Partial | Templates API live; no FE templates browse/install UI |

---

## Remaining gaps

1. **Developer duplication** — `DeveloperModule` vs `DeveloperSettingsController` (`/settings/webhooks`, `/settings/oauth-apps`) overlap; unify under one module (see `DUPLICATES_AND_OBSOLETE.md`)
2. **FE templates UI** — no `(app)/marketplace/templates` page or `marketplaceTemplateService`
3. **FE developer page** — `developer.service.ts` exists but no dedicated `(app)/developer` route; settings/api page uses `developer-settings.service.ts`
4. **Template install side-effects** — install increments count only; no workflow/prompt materialization
5. **OAuth authorize/token flows** — mounted but untested end-to-end
6. **Webhook delivery queue** — `WebhookService.test()` fires inline fetch; no Bull processor wired

---

## Not committed / not pushed

Per instructions — all changes remain uncommitted unless user requests.
