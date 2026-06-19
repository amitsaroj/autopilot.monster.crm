# Implementation Order (Prioritized)

**Audit date:** 2026-06-19 (Session 12)  
**Overall completion estimate: ~83%**

## Phase 0 — Critical Security & Data (P0)

| # | Task | ID | Depends On | Effort |
|---|------|----|------------|--------|
| 1 | Explicit baseline DDL for 71 entities | TASK-011 | Entity audit | L |
| 2 | RS256 JWT in production | TASK-017 | Key management | M |
| 3 | Complete `@ResourcePermissions` + seed permissions | TASK-010 | RBAC seed | L |
| 4 | Workflow action executors (real side effects) | TASK-013 | CRM/voice/WA services | L |
| 5 | Register LimitGuard + verify PlanGuard | TASK-014 | Pricing service | S |

## Phase 1 — Module Completion (P1)

| # | Task | ID | Depends On | Effort |
|---|------|----|------------|--------|
| 6 | Lead scoring rule engine | TASK-016 | CRM events + schema | M |
| 7 | WhatsApp assign/resolve + numbers API | — | WA module | S |
| 8 | WhatsApp Flow Builder entity + UI | — | Flow entity | L |
| 9 | Voice sentiment + post-call summaries | TASK-024 | OpenAI + voice | M |
| 10 | SSO SAML/OIDC backend | — | tenant-settings | M |
| 11 | Cross-tenant HTTP isolation tests | TASK-021 | Test infra | M |
| 12 | Webhook E2E without guard override | TASK-020 | Test infra | M |
| 13 | Wire remaining admin mockData pages | — | Admin services | S |

## Phase 2 — Platform & Billing (P2)

| # | Task | ID | Depends On | Effort |
|---|------|----|------------|--------|
| 14 | PayPal/Razorpay | TASK-022 | Stripe patterns | L |
| 15 | SDK/OAuth developer portal | TASK-023 | dev_platform schema | M |
| 16 | Full-text tsvector search | TASK-025 | Migration | M |
| 17 | Marketing pages | TASK-027 | — | S |
| 18 | Marketplace install + vendor flow | — | plugin entities | M |

## Phase 3 — Quality & Hardening (P3)

| # | Task | ID | Depends On | Effort |
|---|------|----|------------|--------|
| 19 | Expand unit + integration tests to 40% routes | — | — | L |
| 20 | Frontend Playwright smoke in CI | TASK-028 | CI | M |
| 21 | Prometheus /metrics | TASK-033 | — | S |
| 22 | Shared EmptyState/ErrorBoundary | TASK-032 | — | S |
| 23 | Remove legacy auth.controller.ts | TASK-030 | — | S |

## Dependency Graph

```
TASK-011 (migrations) ──► production deploy sign-off
TASK-010 (permissions) ──► TASK-021 (isolation tests)
TASK-017 (RS256) ──► security audit sign-off
TASK-013 (workflows) ──► automation value proposition
TASK-020 (webhook tests) ──► S12 webhook hardening validation
```

## Session 12 Focus

Audit deliverables + webhook hardening + sub-admin ResourcePermissions.
