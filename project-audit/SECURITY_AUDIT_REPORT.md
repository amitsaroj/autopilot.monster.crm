# Security Audit Report — Session 12

**Date:** 2026-06-19  
**Overall grade: B-** (improved from C+ at Session 7)

## Findings Summary

| Severity | Open | Fixed S12 | Fixed Prior |
|----------|------|-----------|-------------|
| CRITICAL | 2 | 0 | 5 (webhooks) |
| HIGH | 4 | 2 | 1 |
| MEDIUM | 6 | 0 | 0 |
| LOW | 5 | 0 | 0 |

## CRITICAL (Open)

### SEC-C001 — Baseline schema via synchronize
- **Risk:** Production schema drift, data loss on deploy
- **Evidence:** `DB_SYNCHRONIZE=true` in docker-compose; BaselineSchema no-op
- **Remediation:** TASK-011 explicit DDL

### SEC-C002 — Permission matrix not enforced for users without seeded permissions
- **Risk:** `@ResourcePermissions` added to 55/109 controllers; users with empty `permissions[]` pass PermissionGuard when no decorator
- **Evidence:** `permission.guard.ts` returns `true` when no permissions required
- **Remediation:** Default-deny for tenant routes or seed all roles with permission sets

## HIGH (Open)

### SEC-H001 — HS256 default JWT
- RS256 supported via `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY` but defaults to HS256
- **Remediation:** TASK-017 — require RS256 in production

### SEC-H002 — LimitGuard not in global guard chain
- Exists but not registered in `app.module.ts`
- **Remediation:** Register globally after PlanGuard

### SEC-H003 — Integration tests bypass real guards
- `app-test.helper.ts` overrides all guards
- **Remediation:** TASK-020

### SEC-H004 — Twilio mock credentials in non-production only
- `twilio.service.ts` falls back to mock client — acceptable in dev; production webhook now rejects mock token (fixed S12)

## HIGH (Fixed Session 12)

### SEC-H005 — Meta webhook accepted unsigned payloads with mock_secret ✅
- **Fix:** Production rejects when `META_APP_SECRET` unset; dev allows mock

### SEC-H006 — Twilio webhooks had no signature validation ✅
- **Fix:** `validateWebhookSignature()` on inbound + status-callback

## Authentication

| Control | Status |
|---------|--------|
| Register/Login/Logout | ✅ |
| Refresh rotation | ✅ |
| MFA TOTP | ✅ |
| OAuth (Google/GitHub/FB/Apple) | ⚠️ Partial provider config |
| Session invalidation | ✅ |
| Edge proxy (Next.js) | ✅ |
| RS256 | ⚠️ Config-ready, not default |

## Authorization

| Guard | Global | Effective |
|-------|--------|-----------|
| JwtAuthGuard | ✅ | ✅ |
| TenantGuard | ✅ | ✅ |
| RolesGuard | ✅ | ✅ (~200 @Roles) |
| PermissionGuard | ✅ | ⚠️ Partial — needs decorators + seeded perms |
| FeatureGuard | ✅ | ✅ when @PlanFeature set |
| PlanGuard | ⚠️ | Stub in some paths |
| LimitGuard | ❌ | Not registered |
| MultiLevelThrottlerGuard | ✅ | ✅ global only |

## Tenant Isolation

| Pattern | Status |
|---------|--------|
| JWT tenantId required | ✅ |
| x-tenant-id header match | ✅ |
| BaseRepository scoping | ⚠️ ~16 repos |
| Manual tenantId in services | ⚠️ Many services |
| Cross-tenant HTTP tests | ⚠️ 1 service-level suite |

## Input Validation & Secrets

| Area | Status |
|------|--------|
| DTO class-validator | ✅ Most routes |
| Helmet + compression | ✅ |
| CORS | ⚠️ Permissive in dev |
| No hardcoded prod secrets | ✅ |
| Webhook signature verification | ✅ After S7+S12 fixes |

## Recommendations (Priority Order)

1. TASK-011 — production DDL migrations
2. TASK-017 — RS256 in production env
3. TASK-010 — complete `@ResourcePermissions` + seed permissions
4. Register LimitGuard globally
5. TASK-020/021 — real-guard integration tests
6. Remove `mock-api-key` fallbacks in production paths (lead-intelligence, fine-tuning, rag)
