# API AUDIT

**Audit date:** 2026-07-22  
**Agent:** 15 — Production Readiness Auditor (post Wave 4)  
**Surface:** NestJS · prefix `/api/v1` · **124 controllers**

---

## Executive summary

| Metric | Value |
|--------|------:|
| Controllers | 124 |
| Integration test suites | 54 |
| Integration tests | 171 PASS |
| Unit test specs | 15 |
| Unit tests | 63 PASS |
| Combined | **234 PASS** |
| `@Body() any` remaining (CRM scope) | AI agents/flows only |
| Unwired modules | **0** (Wave 4 remediated) |

**API maturity:** ~**62%** on critical paths · **0** endpoints meet full DoD stack.

---

## Wave 4 API fixes (verified)

| Area | Fix | Evidence |
|------|-----|----------|
| Developer platform | Module mounted | `DeveloperModule` in `app.module.ts`; 5/5 integration PASS |
| Marketplace templates | Module mounted | `MarketplaceModule` in `PlatformModule`; 3/3 template integration PASS |
| Legacy auth | Removed | No duplicate auth controller tree |
| AI hub usage | Live endpoint | `GET /ai/usage` — hub FE wired |

---

## Waves 1–3 API fixes (verified)

| Area | Fix | Evidence |
|------|-----|----------|
| User groups | Route order | `GET /users/groups` before `:id` |
| Audit read | Envelope + route | `GET /logs/audit` |
| CRM validation | DTOs on write paths | Agent 5 — contacts through campaigns |
| Duplicate merge | Wired | `GET/POST /crm/duplicates/*`, `POST /crm/companies/merge` |
| CRM pagination | Opt-in query params | `CrmListQueryDto` on 7 list endpoints |
| Omnichannel | Registered | `GET/POST /omnichannel/*` with DTOs |
| WhatsApp | Template send, SLA, flow palette | Agent 8 |
| Voice webhooks | Path fix | `@Controller('voice/twilio')` → `/api/v1/voice/twilio/*` |
| Workflow queue | Unified `workflow` | Bull `@Process('execute-workflow')` |
| Queue processors | 9 processors | `queue/processors/*.processor.ts` |
| Billing | Env price resolution | `stripe-price.util.ts`; webhook body validation |
| Billing coupons | Wired | `/billing/coupons/*` |
| AI templates | Wired | `PromptTemplateController` in AiModule |
| AI async generate | Queue producer | `POST /ai/generate/async` |
| Analytics advanced | Wired | `/analytics/advanced/*`; queue persistence |
| Analytics PDF | Wired | `GET /analytics/export-pdf` |

---

## New live API surfaces (Wave 4)

### Developer (`/api/v1/developer/*`)

```
POST/GET/PATCH/DELETE /developer/webhooks[...]
POST/GET/DELETE       /developer/oauth/apps[...]
POST                  /developer/oauth/token (@Public)
GET                   /developer/logs, /developer/logs/stats
```

### Marketplace templates (`/api/v1/marketplace/templates/*`)

```
GET    /marketplace/templates              (@Public — published)
POST   /marketplace/templates              (auth + admin)
PATCH  /marketplace/templates/:id
DELETE /marketplace/templates/:id
POST   /marketplace/templates/:id/install
POST   /marketplace/templates/:id/publish
```

---

## Remaining API gaps

| Gap | Priority | Notes |
|-----|----------|-------|
| CRM audit emitters | High | No service-level `audit.log` on CRUD |
| Search-index → Qdrant | Medium | Processor returns DEFERRED |
| Voice campaign dialer | Medium | `start()` doesn't enqueue contact list |
| Fine-tuning jobs | Low | CRUD only; no OpenAI fine-tune API |
| RAG crawlUrl | Low | Stub returns fake pagesIndexed |
| Dual developer settings | Medium | `/settings/webhooks` overlaps `/developer/webhooks` |
| VoiceCampaignController duplicate | Low | Unregistered duplicate controller |

---

## Validation & permissions

| Pattern | Coverage |
|---------|----------|
| Global `ValidationPipe` | ✅ |
| CRM write DTOs | ✅ Core entities (Agent 5) |
| AI write DTOs | ✅ Including prompt templates (Agent 6) |
| Developer/Marketplace | ✅ DTOs + `@ResourcePermissions` (Agent 12) |
| `@Body() any` | 🟡 AI agents/flows only |
| `@ResourcePermissions` | ✅ On CRM, omnichannel, AI, developer, marketplace |

---

## Test coverage by domain

| Domain | Integration suites | Sample result |
|--------|-------------------|---------------|
| Auth / RBAC | auth-login, rbac-http, secured-guards | ✅ PASS |
| CRM | crm-*-http (12 suites) | ✅ 35/35 with voice |
| Voice | voice-http, voice-read-http | ✅ PASS |
| Workflow | workflow-crud, workflow-meta | ✅ PASS |
| Billing | billing-subscription, webhook, wallet | ✅ PASS |
| AI | ai-platform, ai-agents-read | ✅ 11/11 |
| Analytics | analytics overview/reports/dashboards | ✅ 12/12 |
| Marketplace + Developer | marketplace*, developer-http | ✅ 12/12 |

**API sign-off:** Not ready for production — audit + E2E + ops gaps remain.
