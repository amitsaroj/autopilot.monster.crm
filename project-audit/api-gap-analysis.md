# API Gap Analysis — Session 12

**Date:** 2026-06-19  
**Backend routes:** ~575  
**Controllers:** 109

## Documented vs Implemented

| Domain | Documented | Implemented | Gap |
|--------|------------|-------------|-----|
| Auth | 18 | 22 | OAuth extras |
| CRM | ~110 | 119 | Lead scoring API |
| AI | 40+ | 43 | Usage stub, handoff |
| Voice | 25+ | 26 | Sentiment |
| WhatsApp | 18+ | 19 | Assign/resolve |
| Workflow | 15+ | 16 | Action execution |
| Billing | 20+ | 36 | PayPal/Razorpay |
| Analytics | 20+ | 22 | Activities analytics |
| Admin | 120+ | 123 | Aligned |
| Marketplace | 8 | 7 | Aligned |

## Security Posture by Route Class

| Class | Secured | Validated | Tested |
|-------|---------|-----------|--------|
| Tenant CRM/AI/Voice | JWT+Tenant+Roles+ResourcePerm | DTOs | ~3% |
| Sub-admin | JWT+Roles+ResourcePerm S12 | Partial | 0% |
| Admin SUPER_ADMIN | JWT+Roles | Partial | 0% |
| Public webhooks | @Public + signature S12 | Yes | ~5% |
| Health | @Public | N/A | 1 test |

## Remaining API Gaps

| Severity | Gap |
|----------|-----|
| CRITICAL | ~54 controllers without @ResourcePermissions |
| CRITICAL | Baseline migration (schema) |
| HIGH | Workflow actions queue-only |
| HIGH | Platform /usage /limits stubs |
| HIGH | RS256 not production default |
| MEDIUM | Search reindex stub |
| MEDIUM | RAG usage hardcoded |
| LOW | Legacy auth.controller.ts duplicate |

## Test Coverage

- Routes with any test: ~18 (~3.1%)
- Integration suites: 11
- Unit in src/: 3 suites, 5 tests

## Recommendations

1. TASK-010 — complete ResourcePermissions
2. TASK-013 — workflow executors
3. TASK-020 — webhook tests without guard override
4. Remove dead auth.controller.ts
