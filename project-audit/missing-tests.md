# Missing Tests Audit

**Audit date:** 2026-06-18 (Session 10)

## Summary

| Type | Files Found | Target | Gap |
|------|-------------|--------|-----|
| Unit tests | 2 | 40+ | 38 |
| Integration tests | 11 | 25+ | 14 |
| E2E (Playwright) | 0 | 10+ | 10 |
| Frontend tests | 0 | 20+ | 20 |

## Current Test Files (13 total)

### Unit
- `backend/src/modules/crm/forecast.service.spec.ts`
- `backend/src/modules/crm/deal.service.spec.ts`

### Integration (HTTP)
- `auth.integration.spec.ts`
- `auth-login-http.integration.spec.ts`
- `analytics-reports-http.integration.spec.ts`
- `workflow-crud-http.integration.spec.ts`
- `import-export-http.integration.spec.ts`
- `crm-crud-http.integration.spec.ts`
- `quote-public-http.integration.spec.ts`
- `deal-lifecycle.integration.spec.ts`
- `billing-webhook.integration.spec.ts`
- `health-http.integration.spec.ts`
- `tenant-isolation.integration.spec.ts`

## Missing Unit Tests — By Module

| Module | Priority | Suggested Targets |
|--------|----------|-------------------|
| Auth | CRITICAL | AuthService, MfaService, JwtStrategy |
| Billing | CRITICAL | BillingService, WalletService, Stripe webhook |
| CRM | HIGH | ContactService, LeadService, QuoteLifecycleService |
| Workflow | HIGH | WorkflowService, WorkflowExecutorService |
| AI | HIGH | RagService, ConversationService, FineTuningService |
| Voice | HIGH | VoiceCallService, TwilioService |
| WhatsApp | HIGH | WhatsappService, WhatsappBroadcastService |
| RBAC | HIGH | PermissionGuard, RbacService |
| Tenant | HIGH | TenantGuard, TenantService |
| Search | MEDIUM | SearchService |
| Marketplace | MEDIUM | MarketplaceService |
| Developer | MEDIUM | DeveloperSettingsService |

## Missing Integration Tests

- Cross-tenant HTTP isolation for all modules (partial — 1 suite exists)
- Webhook E2E without guard override (TASK-020)
- Voice call lifecycle (Twilio webhook → DB persist)
- WhatsApp inbound message persistence
- API key authentication flow
- PlanGuard feature denial

## Missing E2E / Frontend Tests

- No Playwright config in frontend
- No component tests (Vitest/Jest)
- CI likely passes integration suite but no browser smoke tests

## CI Gap

- `npm run test:core` fails — Jest CLI option `--testPathPattern` deprecated
- Fix: update `package.json` to use `--testPathPatterns`

**Estimated missing test files: ~80 for adequate coverage**
