# API Audit Report

Mirror of `project-audit/api-gap-analysis.md`.

## Stats

- **570 routes** across 107 controllers
- **~2.6% route test coverage**
- **0 routes** use `@Permissions` decorator

## Session 7 Fixes

- 5 CRM reports routes registered
- 12+ routes marked `@Public()` for webhooks/health/plans/marketplace

## Critical Gaps

- Permission-based RBAC not enforced
- PlanGuard stubbed
- Workflow mock processor
- Search reindex stub
- Legacy auth.controller.ts unwired duplicate

See `project-audit/api-gap-analysis.md` for full detail.
