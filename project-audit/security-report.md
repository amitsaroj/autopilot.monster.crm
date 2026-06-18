# Security Report — Session 7

**Date:** 2026-06-18  
**Auditor:** Automated code verification

## Executive Summary

| Area | Rating | Notes |
|------|--------|-------|
| Authentication | B | MFA/OAuth work; HS256 not RS256 |
| Authorization | C | Roles enforced; permissions unused |
| Tenant isolation | B- | BaseRepository pattern partial |
| Input validation | B | DTOs on most routes; some `any` |
| Secrets management | B | Env-based; mock fallbacks in dev |
| Webhook security | B+ | Fixed @Public; signature checks exist |
| Rate limiting | B | Global throttler; no per-endpoint CRM limits |
| Audit logging | A- | Entity + controller exist |
| Frontend auth | B+ | proxy.ts active (Next.js 16); layout guards |

**Overall security posture: B- (improved from C+ after S7 webhook fixes)**

## JWT

| Requirement (Docs/security.md) | Status |
|--------------------------------|--------|
| RS256 asymmetric signing | **FAIL** — HS256 + JWT_SECRET |
| 15m access / 7d refresh | PASS |
| Refresh token rotation | PASS (hashed in sessions) |
| Payload: sub, tenantId, roles | PASS |

## RBAC

| Component | Status |
|-----------|--------|
| JwtAuthGuard (global) | Active |
| TenantGuard (global) | Active; skips @Public |
| RolesGuard (global) | Active; ~200 @Roles decorators |
| PermissionGuard (global) | **INERT** — 0 @Permissions usages |
| FeatureGuard | Registered |
| PlanGuard | **STUBBED** — TODO in plan.guard.ts |
| LimitGuard | Exists but **not registered** globally |

CRM uses coarse `SUPER_ADMIN | TENANT_ADMIN | USER` instead of `crm:read`, `crm:write` per crm_design.md.

## Tenant Isolation

| Pattern | Coverage |
|---------|----------|
| TenantGuard JWT tenantId required | All non-public routes |
| x-tenant-id header must match JWT | Enforced |
| BaseRepository auto-scoping | 16 repositories |
| Manual tenantId in services | Many services (lead, etc.) |
| Sub-admin routes | Global TenantGuard applies |

**Risk:** Services using raw Repository without tenantId filter could leak — spot-check recommended.

## Rate Limiting

- `MultiLevelThrottlerGuard` registered globally
- CRM-specific limits per crm_design.md §9: **not implemented**
- Public endpoint differentiated limits: **not implemented**

## Webhook & Public Endpoint Fixes (Session 7)

Previously JWT-blocked (production-breaking):
- Health probes
- Stripe webhooks (billing + monetization)
- Twilio voice webhooks
- Meta WhatsApp webhooks

Now marked `@Public()` with signature verification where applicable.

## Mock / Weak Security Paths

| File | Issue | Severity |
|------|-------|----------|
| meta-webhook.controller.ts | `mock_secret` skips signature check | HIGH in dev |
| twilio.service.ts | Mock credentials fallback | MEDIUM |
| lead-intelligence.service.ts | `mock-api-key` fallback | MEDIUM |
| tenant.service.ts | Domain verification always true | HIGH |
| rag.service.ts | Hardcoded usage metrics | LOW |

## Frontend Security

| Control | Status |
|---------|--------|
| Edge proxy (proxy.ts) | **Active** in Next.js 16 build |
| SuperAdmin: SUPER_ADMIN only | Fixed in proxy.ts S7 |
| Admin: TENANT_ADMIN/ADMIN/SUPER_ADMIN | Active |
| Cookie-based tokens | access_token + refresh |
| 401 refresh interceptor | Active |
| 403 redirect | Active |
| CSP/Helmet (backend) | Active |

## Audit Logs

- `audit_log` entity + `AuditLogController` (1 route)
- Admin RBAC audit UI uses **mock data**

## Secrets in Repo

- No hardcoded production secrets found in source
- docker-compose uses dev passwords (expected)
- seed.ts has `price_*_placeholder` Stripe IDs

## Remaining Critical Items

1. Implement `@Permissions` on all sensitive routes
2. Remove mock_secret bypass in production (fail closed)
3. Migrate JWT to RS256
4. Register LimitGuard globally
5. Complete PlanGuard implementation
6. Wire admin RBAC UI to real API (currently mock)
