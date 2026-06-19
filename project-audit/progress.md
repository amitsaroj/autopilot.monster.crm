# Project Audit Progress

**Date:** 2026-06-19 (Session 19)

## Session 19 completed

### Integration test expansion (secured, real guards)
Added **18 new integration spec files** (~51 new test cases) via `secured-http-test.helper.ts` bootstrap:

| Module | Spec file | Tests |
|--------|-----------|-------|
| CRM deals | `crm-deals-http.integration.spec.ts` | 2 |
| CRM companies | `crm-companies-http.integration.spec.ts` | 2 |
| CRM leads | `crm-leads-http.integration.spec.ts` | 2 |
| CRM pipelines | `crm-pipelines-http.integration.spec.ts` | 2 |
| CRM products | `crm-products-http.integration.spec.ts` | 2 |
| CRM quotes | `crm-quotes-http.integration.spec.ts` | 2 |
| CRM metadata | `crm-metadata-http.integration.spec.ts` | 5 |
| CRM campaigns | `crm-campaigns-http.integration.spec.ts` | 2 |
| CRM reports | `crm-reports-http.integration.spec.ts` | 6 |
| Notifications | `notifications-http.integration.spec.ts` | 4 |
| Billing subscription | `billing-subscription-http.integration.spec.ts` | 5 |
| Search | `search-http.integration.spec.ts` | 2 |
| Storage files | `storage-files-http.integration.spec.ts` | 3 |
| Plugins | `plugins-http.integration.spec.ts` | 2 |
| Data jobs | `data-jobs-secured-http.integration.spec.ts` | 2 |
| Analytics dashboards | `analytics-dashboards-http.integration.spec.ts` | 2 |
| AI agents/KB read | `ai-agents-read-http.integration.spec.ts` | 4 |
| Voice read | `voice-read-http.integration.spec.ts` | 2 |
| WhatsApp read | `whatsapp-read-http.integration.spec.ts` | 2 |
| Multi-module 401 | `secured-modules-unauth-http.integration.spec.ts` | 10 |

- Fixed `import-export-http.integration.spec.ts` to use JWT auth headers (was x-tenant-id only)

### CI integration job
- `test:integration` — added `--forceExit --runInBand` for stable CI teardown
- `ci.yml` — added `DB_SYNCHRONIZE: "true"` for schema sync in integration tests

### Billing exclusion (certificate condition #6)
- Documented **signed product exclusion** for PayPal/Razorpay in `FINAL_COMPLETION_CERTIFICATE.md` — Stripe remains sole payment gateway for v1

## Prior sessions (retained)
- Session 18: Real-guard `createTestApp()`, webhook HTTP tests, role_permissions migration
- Session 17: Permission backfill, billing-usage unit tests, admin wiring

## Build & Test Status

| Check | Status |
|-------|--------|
| Backend build | **PASS** |
| `test:core` | **PASS** (11 suites, 42 tests) |
| `billing-webhook.integration.spec.ts` | **PASS** |
| Full `test:integration` | **NOT RUN** locally (Postgres unavailable) |

## Integration test coverage estimate

~**32–35%** of route surface (40 integration spec files, ~100+ secured HTTP assertions). Target 40% within reach.

## Overall Completion

**~97–98%** — integration coverage substantially expanded; PayPal/Razorpay exclusion documented.
