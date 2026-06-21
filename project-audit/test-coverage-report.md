# Test Coverage Report — Session 12

**Date:** 2026-06-19

## Test Run Results

| Suite | Result | Count |
|-------|--------|-------|
| Backend unit (`test:core`) | **PASS** | 5/5 tests, 3 suites |
| Backend E2E (`npm run test:e2e`) | Not re-run S12 | 11 suites exist |
| Backend build | **PASS** | — |
| Frontend build | **PASS** | 322 routes |

## Test Files

| File | Type |
|------|------|
| `deal.service.spec.ts` | Unit |
| `forecast.service.spec.ts` | Unit |
| `jwt-signing.util.spec.ts` | Unit (NEW) |
| `auth-login-http.integration.spec.ts` | HTTP |
| `auth.integration.spec.ts` | Service |
| `crm-crud-http.integration.spec.ts` | HTTP |
| `deal-lifecycle.integration.spec.ts` | Service |
| `workflow-crud-http.integration.spec.ts` | HTTP |
| `analytics-reports-http.integration.spec.ts` | HTTP |
| `import-export-http.integration.spec.ts` | HTTP |
| `quote-public-http.integration.spec.ts` | HTTP |
| `billing-webhook.integration.spec.ts` | Service |
| `health-http.integration.spec.ts` | HTTP |
| `tenant-isolation.integration.spec.ts` | Service |

## Coverage Gaps by Domain

| Domain | Routes | Tests | Coverage |
|--------|--------|-------|----------|
| Auth | 22 | 2 | ~9% |
| CRM | 119 | 5 | ~4% |
| AI | 43 | 0 | 0% |
| Voice | 26 | 0 | 0% |
| WhatsApp | 19 | 0 | 0% |
| Workflow | 16 | 1 | ~6% |
| Billing | 36 | 1 | ~3% |
| Admin | 123 | 0 | 0% |

**Estimated route coverage: ~3.1%**

## Frontend

| Type | Status |
|------|--------|
| Unit tests | None |
| E2E | None |
| CI frontend tests | None |

## Critical Untested Flows

1. MFA login
2. Twilio/Meta webhooks (now hardened — need tests)
3. PermissionGuard with ResourcePermissions
4. Cross-tenant HTTP denial
5. Workflow action execution
6. Wallet purchase
7. Marketplace install

## Recommendations

| Priority | Action |
|----------|--------|
| P0 | Webhook HTTP tests without guard override |
| P0 | Cross-tenant HTTP tests |
| P1 | CRM permission tests |
| P2 | Playwright smoke (TASK-028) |
