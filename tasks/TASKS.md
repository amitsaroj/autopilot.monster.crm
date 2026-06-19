## COMPLETED
- [x] Complete All Missing Pages & Settings (~80 pages)
  - id: TASK-004
  - description: Generate missing layers and connect UI to backend logic (Onboarding, Admin Settings, App Settings).
  - completed_at: 2026-04-04

- [x] CRM MODULE FULL BUILD
  - id: TASK-005
  - completed_at: 2026-04-04

- [x] Hardening CRM Relational Model
  - id: TASK-001
  - completed_at: 2026-04-04

- [x] Automation & Business Logic Layer
  - id: TASK-002
  - completed_at: 2026-04-04

- [x] Data Extraction & Reporting Nexus
  - id: TASK-003
  - completed_at: 2026-04-04

- [x] Premium Frontend Orchestration
  - id: TASK-004
  - completed_at: 2026-04-04

- [x] Fix Role-Based Authentication Routing
  - id: TASK-003
  - completed_at: 2026-04-04

- [x] Upgrade AWS Backend Deployment
  - id: TASK-007
  - completed_at: 2026-04-04

- [x] Fix Terraform and AWS Deployment Pipeline
  - id: TASK-008
  - completed_at: 2026-04-06

- [x] Session 7 Full Audit + Critical Security Fixes
  - id: TASK-009
  - description: End-to-end audit, @Public webhooks/health, CrmReportsController registration, audit reports
  - completed_at: 2026-06-18

## IN_PROGRESS

## PENDING — Prioritized (Session 7 Audit)

### P0 — Critical
- [ ] Activate PermissionGuard with @Permissions on all routes
  - id: TASK-010
  - severity: CRITICAL
  - domain: Security
- [ ] Generate full baseline database migration (76 entities)
  - id: TASK-011
  - severity: CRITICAL
  - domain: Database
- [x] Replace 72 PagePlaceholder routes with real UI
  - id: TASK-012
  - severity: CRITICAL
  - domain: Frontend
  - completed_at: 2026-06-18
- [x] Workflow engine — real action executors with CRM/email/notification side effects
  - id: TASK-013
  - severity: CRITICAL
  - domain: Workflows
  - completed_at: 2026-06-19
- [ ] Implement PlanGuard with real billing feature checks
  - id: TASK-014
  - severity: CRITICAL
  - domain: Billing

### P1 — Important
- [ ] Replace 22 admin mock-data pages with API integration
  - id: TASK-015
  - severity: HIGH
  - domain: Frontend/Admin
- [ ] Lead scoring rule engine (crm_design.md §4)
  - id: TASK-016
  - severity: HIGH
  - domain: CRM
- [ ] RS256 JWT migration per Docs/security.md
  - id: TASK-017
  - severity: HIGH
  - domain: Security
- [ ] Fix domain verification mock (tenant.service.ts)
  - id: TASK-018
  - severity: HIGH
  - domain: Multi-tenant
- [ ] Analytics reports CRUD completion
  - id: TASK-019
  - severity: HIGH
  - domain: Analytics
- [ ] Webhook E2E tests without guard override
  - id: TASK-020
  - severity: HIGH
  - domain: QA
- [ ] Cross-tenant HTTP isolation tests
  - id: TASK-021
  - severity: HIGH
  - domain: QA/Security

### P2 — Enhancement
- [ ] PayPal/Razorpay billing integration
  - id: TASK-022
  - severity: MEDIUM
  - domain: Billing
- [ ] SDK/OAuth developer app management
  - id: TASK-023
  - severity: MEDIUM
  - domain: Developer Platform
- [ ] Voice sentiment and post-call AI summaries
  - id: TASK-024
  - severity: MEDIUM
  - domain: Voice
- [ ] Full-text search tsvector (replace ILIKE)
  - id: TASK-025
  - severity: MEDIUM
  - domain: CRM/Search
- [ ] Social scheduler real API integration
  - id: TASK-026
  - severity: MEDIUM
  - domain: Social
- [ ] Missing marketing pages (/features, /help, /api-docs, /status)
  - id: TASK-027
  - severity: MEDIUM
  - domain: Marketing
- [ ] Frontend Playwright smoke tests in CI
  - id: TASK-028
  - severity: MEDIUM
  - domain: QA
- [ ] MinIO in CI for import/export E2E
  - id: TASK-029
  - severity: MEDIUM
  - domain: DevOps

### P3 — Quality
- [ ] Remove legacy src/auth.controller.ts duplicate
  - id: TASK-030
  - severity: LOW
  - domain: Backend cleanup
- [ ] CRM event naming alignment (crm.* prefix)
  - id: TASK-031
  - severity: LOW
  - domain: CRM
- [ ] Shared EmptyState/ErrorBoundary components
  - id: TASK-032
  - severity: LOW
  - domain: Frontend UX
- [ ] Prometheus metrics endpoint
  - id: TASK-033
  - severity: LOW
  - domain: Observability
