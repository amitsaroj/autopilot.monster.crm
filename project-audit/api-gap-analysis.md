# API Gap Analysis — Session 7

**Date:** 2026-06-18  
**Backend routes:** 570 (565 + 5 CRM reports registered this session)  
**Controllers:** 107

## Documented vs Implemented

| Domain | Documented Routes (Docs) | Implemented | Gap |
|--------|--------------------------|-------------|-----|
| Auth | 18 | 22 | OAuth extras; RS256 not per spec |
| CRM | ~110 | 119 | Reports now registered |
| AI | 40+ | 43 | Usage endpoint stubbed |
| Voice | 25+ | 26 | Sentiment missing |
| WhatsApp | 18+ | 19 | Flow execution partial |
| Workflow | 15+ | 16 | Processor uses mock steps |
| Billing | 20+ | 36 | PayPal/Razorpay absent |
| Analytics | 20+ | 22 | Reports CRUD partial |
| Admin | 120+ | 123 | Aligned |
| Marketplace | 8 | 7 | Aligned |
| Platform | 15+ | 16 | Search reindex stub |

## Security Posture by Route Class

| Class | Secured | Validated | Tested | Notes |
|-------|---------|-----------|--------|-------|
| Authenticated CRM | JWT+Tenant+Roles | DTOs on most | 2 HTTP tests | No `@Permissions` |
| Admin/SuperAdmin | JWT+Roles | Partial | 0 | Some `any` body types |
| Public webhooks | `@Public()` (fixed S7) | Signature check | 1 service test | Was broken pre-S7 |
| Public plans/marketplace | `@Public()` (fixed S7) | N/A | 0 | Was JWT-gated |
| Health probes | `@Public()` (fixed S7) | N/A | 1 (guards overridden) | Was 401 in prod |
| WebSocket | WsJwtGuard | JWT | 0 | OK |

## Critical Gaps Fixed This Session

1. `GET/POST /health`, `/health/ready` — added `@Public()`
2. `POST /billing/webhook`, `POST /monetization/webhook` — added `@Public()`
3. `POST /v1/voice/twilio/inbound`, `status-callback` — added `@Public()`
4. `GET/POST /v1/whatsapp/webhook` — added `@Public()`
5. `GET /billing/plans`, `GET /monetization/plans` — added `@Public()`
6. `GET /marketplace`, `/marketplace/apps`, `/:id` — added `@Public()`
7. `CrmReportsController` — registered in `crm.module.ts` (5 routes)

## Remaining API Gaps

| Severity | Gap | Routes Affected |
|----------|-----|-----------------|
| CRITICAL | `@Permissions()` never used; PermissionGuard inert | All 570 routes |
| CRITICAL | PlanGuard stubbed; `@PlanFeature` unused | Billing-gated features |
| HIGH | RS256 JWT per Docs/security.md | All auth |
| HIGH | LimitGuard not in global chain | All routes |
| HIGH | Legacy `src/auth.controller.ts` duplicate (14 routes, unwired) | Dead code |
| MEDIUM | Search `POST /search/reindex` is console.log stub | 1 |
| MEDIUM | RAG `getUsage()` returns hardcoded values | AI usage |
| MEDIUM | Workflow processor uses `mockSteps` | Workflow execution |
| MEDIUM | Social scheduler fakes external API | Social |
| LOW | CRM event naming inconsistent (`deal.created` vs `crm.deal.won`) | Events |
| LOW | Role naming inconsistency in some controllers | RBAC |

## Test Coverage

- **Routes with any test:** ~15 (~2.6%)
- **Integration tests:** 9 suites, 11 tests (auth, CRM CRUD, deal lifecycle, billing webhook, tenant isolation, health, quote public)
- **E2E guard override:** Most integration tests bypass real guards via `app-test.helper.ts`

## Recommendations (Priority)

1. Add `@Permissions('crm:read')` etc. per `crm_design.md` §10
2. Implement real PlanGuard feature checks
3. Add webhook integration tests without guard override
4. Remove or wire legacy `src/auth.controller.ts`
5. Expand HTTP E2E to voice/WhatsApp webhook flows
