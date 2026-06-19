# WhatsApp Platform Audit — Agent 10

**Date:** 2026-06-19  
**Scope:** Cloud API, Templates, Broadcast, Conversations, Inbox, Assignments, Media, Flow Builder, Webhooks, Analytics  
**Status after fixes:** Functional core with remaining gaps documented below

---

## Executive Summary

The WhatsApp module had a working backend API skeleton but several production-breaking issues: webhook handler returned no response in dev, duplicate `/v1` route prefix, frontend pages using mock data, API contract mismatches between frontend services and backend DTOs, and missing assign/resolve endpoints. Core messaging, templates, broadcasts, conversations, webhooks, and analytics are now wired end-to-end. Flow builder persists via CRM flows API. Phone numbers API and runtime flow execution remain future work.

---

## Backend Inventory

| Component | Path | Status |
|-----------|------|--------|
| Module | `backend/src/modules/whatsapp/whatsapp.module.ts` | ✅ |
| REST controller | `whatsapp.controller.ts` — 21 routes | ✅ |
| Meta webhook | `meta-webhook.controller.ts` | ✅ Fixed |
| Message service | `whatsapp.service.ts` | ✅ Enhanced |
| Template service | `whatsapp-template.service.ts` | ✅ Fixed Meta sync |
| Broadcast service | `whatsapp-broadcast.service.ts` | ✅ |
| Broadcast processor | `whatsapp-broadcast.processor.ts` | ✅ Bull queue |
| Admin settings | `admin/whatsapp-settings/` | ✅ |
| Sub-admin | `sub-admin/whatsapp/` | ✅ |

### Entities

| Table | Entity | Notes |
|-------|--------|-------|
| `whatsapp_messages` | `WhatsAppMessage` | Includes `mediaUrls[]` |
| `whatsapp_templates` | `WhatsAppTemplate` | JSONB `components` |
| `whatsapp_broadcasts` | `WhatsAppBroadcast` | Queue-driven send |

---

## Feature Audit

### Cloud API (Meta Graph)

| Capability | Status | Notes |
|------------|--------|-------|
| Send text message | ✅ | `POST /whatsapp/send`, conversation reply |
| Tenant credentials | ⚠️ | Global env vars; tenant settings UI exists but service reads env |
| Template sync to Meta | ✅ | `POST /whatsapp/templates/:id/sync` |
| Media upload/send | ⚠️ | Inbound media IDs stored; outbound media send not implemented |
| Phone numbers CRUD | ❌ | Documented but not implemented |

### Templates

| Item | Status |
|------|--------|
| List / create / get / update / delete | ✅ |
| Meta approval sync | ✅ |
| Frontend list + create pages | ✅ Fixed DTO mapping (`components`) |

### Broadcast

| Item | Status |
|------|--------|
| CRUD + schedule + send | ✅ |
| Bull queue rate limiting (13ms) | ✅ |
| Contact filter (tags/status) | ✅ |
| Frontend list + create | ✅ Fixed field names (`sent`/`total`) |

### Conversations

| Item | Status |
|------|--------|
| List summaries | ✅ Enriched with contact name, unread, status |
| Get messages by phone | ✅ |
| Send reply | ✅ |
| Assign to agent | ✅ **Added** `POST /whatsapp/conversations/:phone/assign` |
| Resolve | ✅ **Added** `POST /whatsapp/conversations/:phone/resolve` |

Assignment/resolution stores state on matched `Contact` (`ownerId`, `customFields.whatsappStatus`).

### Inbox

| Page | Status |
|------|--------|
| `/whatsapp` | ✅ Wired to API (was mock) |
| `/whatsapp/inbox` | ✅ Wired to API (was mock) |
| `/whatsapp/conversations/[id]` | ✅ Fixed response parsing |

### Media

| Item | Status |
|------|--------|
| Inbound image/video/audio/document/sticker | ✅ Parsed + `mediaUrls` stored |
| Inbound display label | ✅ `[Image]`, `[Document]`, etc. |
| Outbound media messages | ❌ Not implemented |
| Media download from Meta | ❌ Not implemented |

### Flow Builder

| Item | Status |
|------|--------|
| UI (React Flow) | ✅ |
| Persist via `/crm/flows` | ✅ **Fixed** save/load |
| Runtime execution on inbound messages | ❌ Not wired |

### Webhooks

| Item | Status |
|------|--------|
| GET verify (hub challenge) | ✅ |
| POST signature HMAC (production) | ✅ |
| Dev mode without signature | ✅ **Fixed** — now returns 200 + processes |
| Route path | ✅ **Fixed** `/api/v1/whatsapp/webhook` (was double `/v1`) |
| Tenant resolution | ⚠️ Header / `DEFAULT_TENANT_ID` / phone_number_id fallback |

### Analytics

| Item | Status |
|------|--------|
| `GET /analytics/whatsapp` | ✅ total/inbound/outbound |
| Overview dashboard includes WA count | ✅ |
| Admin metrics page | ❌ Still mock UI |
| Frontend service | ✅ **Added** `whatsapp-analytics.service.ts` |

---

## Frontend Services

| Service | Status | Fixes Applied |
|---------|--------|---------------|
| `whatsapp-conversation.service.ts` | ✅ | Types aligned; assign/resolve added |
| `whatsapp-template.service.ts` | ✅ | Maps body/header/footer → components |
| `whatsapp-broadcast.service.ts` | ✅ | Field names + schedule method |
| `whatsapp-analytics.service.ts` | ✅ | New |
| `flow.service.ts` | ✅ | Used by flow builder |

---

## Tests

| Test | Status |
|------|--------|
| `whatsapp-http.integration.spec.ts` | ✅ **Added** — templates, broadcast, messages, assign, resolve, analytics, webhook |
| Prior WhatsApp-specific tests | ❌ None (only entity mocks in tenant isolation) |

Run:
```bash
cd backend && npm test -- whatsapp-http.integration.spec.ts
```

---

## Issues Found & Fixed

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | **Critical** | Webhook POST returned early in dev without HTTP 200 | Process payload + `res.status(200).send('OK')` |
| 2 | **Critical** | Webhook route `/api/v1/v1/whatsapp/webhook` | Controller path → `whatsapp/webhook` |
| 3 | **High** | Main WhatsApp page used hardcoded mock chats | Wired to `GET /whatsapp/conversations` |
| 4 | **High** | Inbox page mock data | Wired to conversation API |
| 5 | **High** | Template create payload mismatch (`body` vs `components`) | Frontend maps to Meta component structure |
| 6 | **High** | Broadcast UI used `sentCount`/`recipientCount` | Aligned to backend `sent`/`total` |
| 7 | **High** | Conversation detail expected nested `{ messages }` | Uses message array from API |
| 8 | **High** | Missing assign/resolve API | Added endpoints + contact-backed state |
| 9 | **Medium** | Broadcast new page wrong redirect `/broadcasts` | Fixed to `/whatsapp/broadcast` |
| 10 | **Medium** | Meta template sync sent wrong components shape | `resolveTemplateComponents()` helper |
| 11 | **Medium** | Inbound media always `[Media/Unsupported]` | Type-aware parsing + `mediaUrls` |
| 12 | **Medium** | Flow builder not persisted | Save/load via `flowService` |
| 13 | **Low** | No WhatsApp integration tests | Added HTTP integration suite |

---

## Remaining Gaps (Not Fixed — Out of Scope)

1. **`GET/POST/DELETE /whatsapp/numbers`** — phone number provisioning API
2. **Outbound media messages** — image/document send via Cloud API
3. **Per-tenant Meta credentials** in `WhatsappService` (currently env-global)
4. **Flow runtime engine** — execute saved flows on inbound webhook events
5. **Admin metrics page** — still placeholder charts
6. **Dedicated `whatsapp_conversations` table** — assignment uses Contact custom fields
7. **Template message sends in broadcast** — currently sends rendered text, not Meta template API
8. **Webhook tenant mapping** via `phone_number_id` is not a tenant UUID

---

## API Route Reference (Post-Fix)

```
POST   /whatsapp/send
GET    /whatsapp/messages
GET    /whatsapp/conversations
GET    /whatsapp/conversations/:phone
POST   /whatsapp/conversations/:phone/messages
POST   /whatsapp/conversations/:phone/assign      ← NEW
POST   /whatsapp/conversations/:phone/resolve     ← NEW
GET    /whatsapp/templates
POST   /whatsapp/templates
GET    /whatsapp/templates/:id
PATCH  /whatsapp/templates/:id
DELETE /whatsapp/templates/:id
POST   /whatsapp/templates/:id/sync
GET    /whatsapp/broadcasts
POST   /whatsapp/broadcasts
GET    /whatsapp/broadcasts/:id
POST   /whatsapp/broadcasts/:id/send
PATCH  /whatsapp/broadcasts/:id/schedule
DELETE /whatsapp/broadcasts/:id
GET    /analytics/whatsapp
GET    /whatsapp/webhook          ← Meta verify (public)
POST   /whatsapp/webhook          ← Meta inbound (public)
```

All tenant routes prefixed with `/api/v1` and require JWT + `@PlanFeature('whatsapp')`.

---

## Recommendations (Priority)

1. Implement `/whatsapp/numbers` for WABA phone management
2. Use tenant-scoped credentials from `tenant-settings` in `WhatsappService`
3. Send broadcasts via Meta template API instead of plain text
4. Wire flow engine to `processIncomingMessage`
5. Connect admin metrics page to `whatsappAnalyticsService`
6. Add webhook integration test with valid HMAC signature

---

## Files Changed (This Audit)

**Backend**
- `meta-webhook.controller.ts`
- `whatsapp.service.ts`
- `whatsapp.controller.ts`
- `whatsapp-template.service.ts`
- `dto/whatsapp-conversation.dto.ts` (new)
- `test/integration/whatsapp-http.integration.spec.ts` (new)

**Frontend**
- `services/whatsapp-conversation.service.ts`
- `services/whatsapp-template.service.ts`
- `services/whatsapp-broadcast.service.ts`
- `services/whatsapp-analytics.service.ts` (new)
- `app/(app)/whatsapp/page.tsx`
- `app/(app)/whatsapp/inbox/page.tsx`
- `app/(app)/whatsapp/conversations/[id]/page.tsx`
- `app/(app)/whatsapp/broadcast/page.tsx`
- `app/(app)/whatsapp/broadcast/new/page.tsx`
- `app/(app)/whatsapp/flow-builder/page.tsx`

**Audit**
- `project-audit/whatsapp-audit.md` (this file)
