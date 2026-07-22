# Agent 08 — WhatsApp Platform

**Date:** 2026-07-22  
**Wave:** WhatsApp platform completion (BL-H04 partial; F-023/024; omnichannel WhatsApp routing)

## Completed

### Cloud API / webhooks (F-023)
| Item | Status | Evidence |
|------|--------|----------|
| Webhook verify (GET) | Already wired | `meta-webhook.controller.ts` |
| Inbound message parse | Enhanced | Media + text; delivery status updates via `statuses[]` |
| Signature verification | Already wired | HMAC `x-hub-signature-256`; prod guard when secret missing |
| Send text | Enhanced | Meta Graph API + local persist; axios errors → `BadRequestException` |
| Send template | **Added** | `POST /whatsapp/send-template` + `sendTemplateMessage()` |
| Meta sync templates | Already wired | `WhatsappTemplateService.syncWithMeta()` |
| Meta env docs | **Added** | `backend/.env.example` — `WHATSAPP_*`, `META_*`, `DEFAULT_TENANT_ID`, `WHATSAPP_SLA_MS` |

### Inbox / conversations (FE ↔ BE)
| Endpoint | FE service | Status |
|----------|------------|--------|
| `GET /whatsapp/conversations` | `whatsappConversationService.list()` | Aligned |
| `GET /whatsapp/conversations/:phone` | `getMessages()` | Aligned (array in `data`) |
| `POST /whatsapp/conversations/:phone/messages` | `send()` | Aligned; **DTO validated** (`SendConversationMessageDto`) |
| `POST .../assign`, `.../resolve` | `assign()`, `resolve()` | Aligned |
| `(app)/inbox` | omnichannel → WA fallback | Already wired (prior wave) |
| `(app)/whatsapp/inbox` | direct WA API | Aligned |

### Broadcast / templates (F-024)
| Item | Status | Evidence |
|------|--------|----------|
| CRUD + send + schedule | Already wired | `WhatsappController` + `WhatsappBroadcastService` |
| Bull processor | Already wired | `WhatsappBroadcastProcessor` |
| Segment expansion stub | **Fixed** | `contactFilter.segmentIds` resolves tags from segment rules |
| Duplicate `BroadcastController` | Unchanged (not mounted) | `broadcast.controller.ts` + stub `broadcast.service.ts` remain dead code |

### Flow builder
| Item | Status | Evidence |
|------|--------|----------|
| Node palette stub | **Fixed** | `getFlowBuilderNodes()` returns real node definitions |
| SLA stub | **Fixed** | `calculateInboxSLA()` from message timestamps vs `WHATSAPP_SLA_MS` |
| FE flow-builder | **Wired** | Loads palette from `GET /whatsapp/flow-builder/nodes`; saves via `/crm/flows` |

### Omnichannel (F-022 partial)
| Item | Status | Evidence |
|------|--------|----------|
| `POST /omnichannel/send` WHATSAPP | **Fixed** | Routes to `WhatsappService.sendTextMessage` via contact phone |
| `GET /omnichannel/conversations` | **Fixed** | Merges WA summaries (`wa:{phone}`) + non-WA DB conversations |
| `GET .../messages` | **Fixed** | Resolves `wa:{phone}` → WhatsApp thread |
| `POST .../route` | **Fixed** | WA uses contact `ownerId`; DB conv uses contact owner |
| Response envelope | **Fixed** | Standard `{ status, message, error, data }` |
| Validation + permissions | **Added** | `SendOmnichannelMessageDto`; `@ResourcePermissions('omnichannel')` |

## Endpoints touched

```
POST   /api/v1/whatsapp/send-template          (new)
GET    /api/v1/whatsapp/inbox/sla              (envelope + real calc)
GET    /api/v1/whatsapp/flow-builder/nodes     (envelope + palette)
POST   /api/v1/whatsapp/conversations/:phone/messages  (validated DTO)
POST   /api/v1/omnichannel/send                (WA routing, envelope, DTO)
GET    /api/v1/omnichannel/conversations         (merge WA + DB, envelope)
GET    /api/v1/omnichannel/conversations/:id/messages
POST   /api/v1/omnichannel/conversations/:id/route
POST   /api/v1/whatsapp/webhook                (status updates)
```

## Test / build results
- Backend `nest build`: **FAIL** — pre-existing TS6133/TS6138 in `voice.controller.ts`, `campaign.service.ts` (not introduced this wave)
- WhatsApp integration tests: **blocked** by same compile errors (0 tests executed)
- Prior evidence: `whatsapp-http.integration.spec.ts` covers conversations, template, broadcast, webhook

## Remaining WhatsApp gaps

| Gap | Priority | Notes |
|-----|----------|-------|
| Live Meta credentials / prod webhook handshake | High | Needs real `WHATSAPP_TOKEN`, `META_APP_SECRET`, tenant routing strategy |
| Broadcast uses plain text not Meta template API | Medium | Processor calls `sendTextMessage`; should use `sendTemplateMessage` when template approved |
| Dead duplicate broadcast module | Low | Remove `broadcast.controller.ts` / `broadcast.service.ts` or merge |
| Flow execution engine | **Done** | Inbound → `MESSAGE_RECEIVED` → keyword match on published `type=whatsapp` flows → Bull `WorkflowProcessor` + `WorkflowActionExecutor` (SEND_MESSAGE/TEMPLATE/ASSIGN/RESOLVE) |
| Per-tenant WABA credentials | High | Global env vars only; admin WhatsApp settings module exists but not wired to send path |
| Omnichannel EMAIL/VOICE send | Medium | Still DB-stub for non-WA channels |
| Admin WhatsApp nav children | Low | BL-H14 dead links under `/admin/whatsapp/*` |
| Frontend automated tests | Critical | BL-C10 — zero FE tests |
| DoD ✅ Complete | — | Still blocked globally (audit coverage, FE tests, prod Meta ops) |

## Not committed / not pushed
Per instructions.
