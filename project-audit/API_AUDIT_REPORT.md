# API Audit Report — Session 12

**Date:** 2026-06-19  
**Controllers:** 109 (includes legacy `src/auth.controller.ts` duplicate)  
**Estimated routes:** ~575

## Route Classification

| Class | Count (est.) | Secured | Validated | Tested |
|-------|--------------|---------|-----------|--------|
| Tenant authenticated | ~380 | JWT+Tenant+Roles | DTOs ~90% | ~3% |
| Admin (SUPER_ADMIN) | ~123 | JWT+Roles | Partial | 0% |
| Sub-admin (ADMIN) | ~42 | JWT+Roles+ResourcePerm S12 | Partial | 0% |
| Public (auth, webhooks, health) | ~30 | @Public + signatures | Partial | ~5% |

## Security Posture

| Control | Coverage |
|---------|----------|
| `@Public()` on webhooks/health | ✅ Fixed S7 |
| `@ResourcePermissions` | ⚠️ 55/109 controllers (50%) |
| `@Roles` coarse RBAC | ✅ ~200 decorators |
| `@PlanFeature` + FeatureGuard | ⚠️ Partial decoration |
| Swagger/OpenAPI | ✅ Most controllers |
| Rate limiting | ✅ Global throttler only |

## Domain API Status

| Domain | Routes | Complete | Partial | Missing |
|--------|--------|----------|---------|---------|
| Auth | 22 | 18 | 4 | 0 |
| CRM | 119 | 105 | 12 | 2 |
| AI | 43 | 30 | 11 | 2 |
| Voice | 26 | 18 | 7 | 1 |
| WhatsApp | 19 | 12 | 6 | 1 |
| Workflow | 16 | 10 | 6 | 0 |
| Billing | 36 | 28 | 6 | 2 |
| Analytics | 22 | 16 | 5 | 1 |
| Admin | 123 | 110 | 13 | 0 |
| Marketplace | 7 | 6 | 1 | 0 |
| Platform/Other | ~143 | 100 | 35 | 8 |

## Known Stubs / Broken Endpoints

| Endpoint | Issue |
|----------|-------|
| `POST /search/reindex` | console.log stub |
| AI usage endpoints | Hardcoded metrics in rag.service |
| `GET /usage`, `/limits`, `/features` (platform) | Empty object stubs |
| Workflow action steps | Return QUEUED, no execution |
| Social scheduler | Fakes external API |
| Lead scoring batch | No API trigger |

## Webhook Endpoints (Post S12)

| Route | Public | Signature | Prod Safe |
|-------|--------|-----------|-----------|
| `POST /billing/webhook` | ✅ | Stripe | ✅ |
| `POST /monetization/webhook` | ✅ | Stripe | ✅ |
| `POST /v1/voice/twilio/inbound` | ✅ | Twilio S12 | ✅ |
| `POST /v1/voice/twilio/status-callback` | ✅ | Twilio S12 | ✅ |
| `GET/POST /v1/whatsapp/webhook` | ✅ | Meta HMAC S12 | ✅ |

## Test Coverage

- **Routes with any automated test:** ~18 (~3.1%)
- **Integration suites:** 11 (guard override in most)
- **Unit tests in src/:** 3 suites (deal, forecast, jwt-signing)

## Recommendations

1. Complete TASK-010 on remaining 54 controllers
2. Remove dead `src/auth.controller.ts`
3. Implement workflow action executors with real service calls
4. Add HTTP tests for webhooks without guard override
5. Document public route list in OpenAPI tags
