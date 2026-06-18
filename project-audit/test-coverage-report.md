# Test Coverage Report — Session 7

**Date:** 2026-06-18

## Test Run Results (Session 7)

| Suite | Result | Count |
|-------|--------|-------|
| Backend unit (`npm test`) | **PASS** | 2/2 tests, 2 suites |
| Backend E2E (`npm run test:e2e`) | **PASS** | 11/11 tests, 9 suites |
| Backend build (`npm run build`) | **PASS** | — |
| Frontend build (`npm run build`) | **PASS** | 322 routes |

## Test Files

| File | Type | Coverage |
|------|------|----------|
| `deal.service.spec.ts` | Unit | Deal mark-won + event |
| `forecast.service.spec.ts` | Unit | Forecast aggregation |
| `auth-login-http.integration.spec.ts` | HTTP | Login success + bad password |
| `auth.integration.spec.ts` | Service | Unknown user rejection |
| `crm-crud-http.integration.spec.ts` | HTTP | Contact CRUD + list |
| `deal-lifecycle.integration.spec.ts` | Service | Deal won + events |
| `quote-public-http.integration.spec.ts` | HTTP | Public quote 404 |
| `billing-webhook.integration.spec.ts` | Service | Webhook signature rejection |
| `health-http.integration.spec.ts` | HTTP | Health endpoint |
| `tenant-isolation.integration.spec.ts` | Service | Contact tenant scoping |

## Coverage Gaps

### By Domain (570 API routes)

| Domain | Routes | Tests | Coverage % |
|--------|--------|-------|------------|
| Auth | 22 | 2 | ~9% |
| CRM | 119 | 4 | ~3% |
| AI | 43 | 0 | 0% |
| Voice | 26 | 0 | 0% |
| WhatsApp | 19 | 0 | 0% |
| Workflow | 16 | 0 | 0% |
| Billing | 36 | 1 | ~3% |
| Admin | 123 | 0 | 0% |
| Analytics | 22 | 0 | 0% |
| Other | 144 | 1 | <1% |

**Estimated total route coverage: ~2.6%**

### Frontend

| Type | Status |
|------|--------|
| Unit tests | **None** |
| Component tests | **None** |
| E2E (Playwright/Cypress) | **None** |
| Visual regression | **None** |

### Critical Untested Flows

1. MFA login flow
2. OAuth callbacks
3. Stripe webhook end-to-end (with @Public)
4. Twilio/Meta webhooks (now public)
5. Permission/Plan guards
6. Cross-tenant access attempts (HTTP level)
7. Wallet credit purchase
8. Marketplace install/uninstall
9. Workflow execution
10. WhatsApp broadcast send

## Test Infrastructure Issues

- `app-test.helper.ts` overrides all guards to `canActivate: () => true` — integration tests do not validate real auth
- Worker process leak warning in E2E (improper teardown)
- No frontend test script in CI
- MinIO commented out in docker-compose — import/export E2E blocked

## Recommendations

| Priority | Action |
|----------|--------|
| P0 | Add HTTP tests for webhooks without guard override |
| P0 | Add cross-tenant isolation HTTP test (expect 403/404) |
| P1 | Add deal lifecycle HTTP E2E |
| P1 | Add billing wallet flow test |
| P2 | Add Playwright smoke tests for login + CRM list |
| P2 | Enable MinIO in CI for storage tests |
