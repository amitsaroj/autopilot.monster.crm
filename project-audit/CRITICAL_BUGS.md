# Critical & High Bugs — Remaining After Audit Fixes

**Date:** 2026-06-19  
**Source:** 15 domain audit agents — open issues only (fixed items excluded)

This document lists **remaining** CRITICAL and HIGH severity issues after the 2026-06-19 audit swarm fixes. Many critical bugs were resolved during the audit (auth flows, webhooks, tenant suspension, feature flag hierarchy, etc.).

---

## CRITICAL — Open

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| SEC-C001 | Security / Infra | Production schema relies on `DB_SYNCHRONIZE` or incomplete migrations | Schema drift, data loss on deploy | TASK-011: full baseline DDL for 76 entities; enforce `DB_SYNCHRONIZE=false` in prod |
| SA-C001 | Super Admin | No admin HTTP/integration test suite | Regressions undetected; RBAC untested at platform level | Add `admin-*-http.integration.spec.ts` for tenants, users, flags, billing |
| BILL-C001 | Billing | `trackUsage()` defined but never invoked by feature modules | Usage limits ineffective; no metered billing data | Wire from CRM, AI, Voice, WhatsApp on billable events |
| INFRA-C001 | Infra | `AdminBackupsService` / `AdminRestoreService` are stubs | Platform backup/restore non-functional | Wire to `pg_dump` + MinIO upload; test restore runbook |
| INFRA-C002 | Infra | No automated Postgres off-site backups | Data loss on EC2/volume failure | Cron pg_dump → S3 with retention policy |

---

## HIGH — Open

### Security & Auth

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| SEC-H003 | Security | Integration tests override all guards (`app-test.helper.ts`) | False confidence in RBAC/tenant isolation | TASK-020: real-guard integration suite |
| AUTH-H001 | Auth | SSO backend not implemented (SAML/OIDC) | Enterprise SSO sales blocker | Implement passport strategies + ACS/callback |
| AUTH-H004 | Auth | Forgot-password requires tenant header | Multi-tenant email users may not receive reset | Global email lookup or tenant slug on form |
| AUTH-H007 | Auth | Integration tests excluded from Jest CI | Auth regressions not caught in pipeline | Include `/test/integration/` in CI |

### Super Admin

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| SA-H001 | Super Admin | Feature flags UI missing | Cannot manage global kill switches | Create `/superadmin/feature-flags` |
| SA-H002 | Super Admin | Pricing settings UI missing | Cannot configure platform pricing | Create `/superadmin/pricing` |
| SA-H003 | Super Admin | Usage dashboard UI missing | No platform usage visibility | Create `/superadmin/usage` |
| SA-H004 | Super Admin | Tenant/user CRUD UI missing | Cannot provision tenants or manage users | Add create/edit/detail forms |
| SA-H005 | Super Admin | Plan CRUD UI missing | Cannot manage plan tiers/features | Build plan editor with feature/limit management |
| SA-H006 | Super Admin | Platform analytics charts use dummy data | Misleading operational dashboards | Add time-series API + wire Recharts |
| SA-H007 | Super Admin | Audit mutations may not call `AuditLogService.log()` | Incomplete audit trail | Verify all admin mutations log |
| SA-H008 | Super Admin | Audit entity schema mismatch (`outcome`, `actor`) | Frontend filters unreliable | Extend entity or standardize `changes` JSONB |

### Billing

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| BILL-H001 | Billing | PayPal/Razorpay not implemented | No alternative payment gateways | Implement or document signed exclusion |
| BILL-H002 | Billing | Stripe metered billing not connected | No overage charges | Stripe usage records + metered prices |
| BILL-H003 | Billing | Upgrade/usage frontend pages use mock data | Users cannot self-serve plan changes | Wire to `/monetization/plans` and `/billing` usage |
| BILL-H004 | Billing | Stripe price IDs are placeholders in seed | Checkout fails without real Stripe config | Configure real prices or document setup |
| BILL-H005 | Billing | Duplicate webhook routes (`/billing/webhook`, `/monetization/webhook`) | Confusion, potential double-processing | Consolidate to single endpoint |

### Tenant

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| TEN-H001 | Tenant | TRIAL expiry automation missing | Trial tenants never auto-suspend | Scheduler job TRIAL → SUSPENDED |
| TEN-H002 | Tenant | Tenant lifecycle events not persisted to audit table | Compliance gap | Wire EventEmitter → AuditLogService |

### CRM

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| CRM-H001 | CRM | Analytics pipeline compares `stageId` UUID to stage name strings | Win rate always 0; empty pipeline charts | Join `PipelineStage` entity (partially fixed in analytics audit; verify CRM reports) |
| CRM-H002 | CRM | Segment rules stored but not evaluated | Segments non-functional for automation | Implement filter engine or mark as future |

### AI

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| AI-H001 | AI | No CRM tool calling (OpenAI functions) | AI cannot perform CRM actions | Implement per Docs/ai_engine.md |
| AI-H002 | AI | Agent entity missing `knowledgeBaseIds`, tools, channels | Agent config incomplete | Schema extension + UI |

### Voice

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| VOICE-H001 | Voice | Campaign start does not enqueue outbound dials | Bulk calling non-functional | Implement dial queue worker |
| VOICE-H002 | Voice | TTS/transcribe endpoints are stubs | API returns fake queued status | Implement or remove endpoints |

### WhatsApp

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| WA-H001 | WhatsApp | Flow runtime not wired to inbound webhooks | Flow builder has no effect | Connect `processIncomingMessage` to saved flows |
| WA-H002 | WhatsApp | Per-tenant Meta credentials not used in service | All tenants share global env credentials | Read from tenant-settings |
| WA-H003 | WhatsApp | Broadcast sends plain text, not Meta template API | Template broadcasts may fail Meta compliance | Use template message API |

### Workflow

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| WF-H001 | Workflow | Visual builder is static mock | Non-technical users cannot build workflows | Replace with node editor wired to API |
| WF-H002 | Workflow | No condition branching in executor | Complex automations impossible | Support ifTrue/ifFalse graph paths |
| WF-H003 | Workflow | LEAD_CREATED / WHATSAPP triggers unwired | Documented triggers never fire | Add domain event emitters + listeners |

### Marketplace

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| MKT-H001 | Marketplace | Premium install does not add Stripe subscription item | Revenue leakage on paid plugins | Add subscription item on install |
| MKT-H002 | Marketplace | No vendor entity or developer portal | Third-party plugin ecosystem blocked | Build vendor table + registration |

### Infra

| ID | Domain | Issue | Impact | Remediation |
|----|--------|-------|--------|-------------|
| INFRA-H001 | Infra | Redis AOF disabled — queue/cache loss on crash | Workflow/WhatsApp jobs lost | Enable `--appendonly yes` |
| INFRA-H002 | Infra | No Prometheus metrics | No operational alerting | TASK-033 |
| INFRA-H003 | Infra | Production secrets must be on S3 before deploy | Deploy fails or uses wrong config | Upload `deploy/backend/.env.production` |
| INFRA-H004 | Infra | `.env.example` DB name mismatch vs compose | Developer onboarding confusion | Align `autopilot_crm` vs `autopilot_monster` |

---

## Fixed Critical Bugs (Reference — Do Not Reopen)

These were resolved during the 2026-06-19 audit and should not appear as open blockers:

| ID | Domain | Issue | Fix Status |
|----|--------|-------|------------|
| AUTH-C001–C009 | Auth | Email verify, MFA, refresh rotation, logout, roles, OAuth hash, sessions | ✅ Fixed |
| SEC-C002 | Security | PermissionGuard default-allow | ✅ Fixed — default-deny S15 |
| SEC-H001 | Security | HS256 default in production | ✅ Fixed — RS256 enforced S15 |
| SEC-H008 | Security | Stripe webhook without secret | ✅ Fixed S15 |
| SEC-H009 | Security | Meta webhook HMAC bypass | ✅ Fixed — raw body S15 |
| TEN-C001 | Tenant | Duplicate admin routes | ✅ Fixed |
| TEN-C002 | Tenant | Suspension not enforced | ✅ Fixed — ActiveTenantGuard |
| TEN-H001 | Tenant | Overrides ignored by guards | ✅ Fixed — PricingService |
| FF-C001 | Feature Flags | Global flags/tenant overrides ignored at runtime | ✅ Fixed — full hierarchy |
| FF-H001 | Feature Flags | Duplicate FeatureGuard blocked SUPER_ADMIN | ✅ Fixed — removed from APP_GUARD |
| WA-C001 | WhatsApp | Webhook returned no response in dev | ✅ Fixed |
| WA-C002 | WhatsApp | Double `/v1` route prefix | ✅ Fixed |
| BILL-C001–C010 | Billing | Invoice webhook, wallet security, trial provisioning, etc. | ✅ Fixed (10 items) |
| WF-C001–C014 | Workflow | Voice action, retry API, admin mock data, etc. | ✅ Fixed (14 items) |

---

## Bug Count Summary

| Severity | Open | Fixed (this audit) |
|----------|------|---------------------|
| CRITICAL | 5 | ~25 |
| HIGH | 35 | ~40 |
| **Total actionable** | **40** | **~65** |

**Recommendation:** Resolve all 5 open CRITICAL items before production launch. HIGH items in Super Admin, Billing, and Infra categories are the next sprint priority.
