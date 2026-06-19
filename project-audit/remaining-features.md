# Remaining Features — Session 7

## P0 — Critical

- PermissionGuard activation (`@Permissions` on all sensitive routes)
- Full database migrations (70+ entities without DDL)
- 72 PagePlaceholder tenant app routes
- Workflow mock processor replacement
- PlanGuard / feature gating completion

## P1 — Important

- 22 admin pages with mock data → wire to APIs
- Lead scoring (rule-based, crm_design.md)
- RS256 JWT migration
- Domain verification (remove mock)
- Analytics reports CRUD completion
- Full-text search tsvector (beyond ILIKE)
- Webhook integration tests (Stripe, Twilio, Meta)
- Cross-tenant isolation HTTP tests

## P2 — Enhancement

- PayPal/Razorpay billing
- SDK/OAuth developer app management
- Voice sentiment and post-call summaries
- SSO configuration endpoints + UI
- Social scheduler real API integration
- AI usage metering (remove RAG stub)
- Missing marketing pages (/features, /help, /api-docs, /status)
- MinIO in CI for storage E2E
- Frontend Playwright smoke tests

## P3 — Quality

- Remove legacy `src/auth.controller.ts` duplicate
- CRM event naming alignment (`crm.*` prefix)
- Shared EmptyState/ErrorBoundary components
- Admin pages use service layer (not raw fetch)
- Worker process teardown in E2E tests
- Prometheus metrics endpoint

## Session 7 Completed

- `@Public()` on health, webhooks, public plans, marketplace
- CrmReportsController registered (5 routes)
- SuperAdmin proxy role fix (SUPER_ADMIN only)
- Full audit deliverables (7 reports + 8 root mirrors)
- All builds and 13 backend tests pass
