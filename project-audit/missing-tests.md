# Missing Tests Audit

## Current State

- Jest configured in `backend/package.json`
- Scripts: `test`, `test:watch`, `test:cov`, `test:e2e`, `test:core`
- **Zero test files found** (`*.spec.ts`, `*.test.ts`, `*.test.tsx`)

## Required Test Coverage (per Docs/qa_batch*.md)

### Unit Tests — Missing

| Module | Priority | Suggested Targets |
|--------|----------|-------------------|
| CRM Services | CRITICAL | ContactService, DealService, LeadConversionService, ForecastService |
| Auth | CRITICAL | AuthService, MfaService, JwtStrategy |
| Billing | CRITICAL | BillingService, PricingService, Stripe webhook handler |
| Workflow | HIGH | WorkflowService, WorkflowProcessor |
| AI | HIGH | RagService, ConversationService |
| Voice | HIGH | TwilioService, VoiceCallService |
| WhatsApp | HIGH | WhatsappService, MetaWebhookController |
| RBAC | HIGH | RbacService, PermissionGuard |
| Tenant | HIGH | TenantGuard, tenant isolation in BaseRepository |

### Integration Tests — Missing

- Multi-tenant data isolation (cross-tenant access denied)
- Auth flow (login → refresh → logout)
- CRM lead conversion pipeline
- Stripe webhook → subscription state update
- Workflow trigger → execution → completion

### E2E Tests — Missing

- `jest-e2e.config.ts` referenced but no e2e test files
- Post-deployment smoke tests mentioned in build_order.md — not in repo

### Frontend Tests — Missing

- No Vitest/Jest/Playwright config found in frontend
- No component or page tests

## CI Gap

`.github/workflows/` exists but test execution likely passes vacuously with 0 tests.

**Estimated missing test files: 100+ for adequate coverage**
**Current test files: 0**
