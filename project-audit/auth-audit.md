# Authentication Audit Report — Agent 3

**Date:** 2026-06-19  
**Scope:** Login, Register, Forgot/Reset Password, Email Verification, JWT, Refresh Tokens, RBAC, Tenant Isolation, Session Management, 2FA, SSO, OAuth  
**Overall grade: B** (improved from C+ after critical fixes in this session)

---

## Executive Summary

The auth stack is structurally sound: NestJS Passport JWT, global guards, bcrypt password hashing, MFA via TOTP, OAuth providers, and refresh-token persistence. Several **critical flow breaks** were found and fixed in this audit (email verification email missing, MFA secret not loaded at login, refresh token rotation/tenant resolution, logout not revoking tokens, new tenants missing admin role).

Remaining gaps are mostly **production hardening** (RS256 default, SAML/OIDC SSO backend, permission default-deny, expanded E2E coverage).

---

## Flow Coverage Matrix

| Flow | Backend | Frontend | Tests | Status |
|------|---------|----------|-------|--------|
| Register | ✅ `POST /auth/register` | ✅ `/register` | ⚠️ Unit only | **Fixed** — verification email + TENANT_ADMIN bootstrap |
| Login | ✅ `POST /auth/login` | ✅ `/login` | ✅ HTTP E2E (login) | ✅ Working |
| Forgot Password | ✅ `POST /auth/forgot-password` | ✅ `/forgot-password` | ❌ None | ⚠️ Requires tenant context for lookup |
| Reset Password | ✅ `POST /auth/reset-password` | ✅ `/reset-password?token=` | ❌ None | **Fixed** — revokes sessions on reset |
| Email Verification | ✅ `POST /auth/verify-email` | ✅ `/verify-email?token=` | ❌ None | **Fixed** — verification email now sent |
| Refresh Token | ✅ `POST /auth/refresh` | ✅ Axios interceptor | ❌ None | **Fixed** — rotation + JWT tenantId source |
| Logout | ✅ `POST /auth/logout` | ✅ `authService.logout` | ❌ None | **Fixed** — revokes refresh token |
| Change Password | ✅ `POST /auth/change-password` | ⚠️ Settings page | ❌ None | **Fixed** — invalidates all sessions |
| MFA Enable/Verify/Disable | ✅ `/auth/mfa/*` | ✅ `/mfa` | ❌ None | **Fixed** — MFA secret loaded at login |
| Session List/Revoke | ✅ `/auth/sessions` | ✅ Service methods | ❌ None | **Fixed** — ownership check on revoke |
| OAuth (Google/GitHub/FB/Apple) | ✅ Passport strategies | ✅ Login buttons + `/auth/callback` | ❌ None | **Fixed** — tokens in URL hash, not query |
| SSO (SAML/OIDC) | ❌ No backend | ⚠️ Settings UI only | ❌ None | **Not implemented** |

---

## Critical Issues Found & Fixed (This Session)

### AUTH-C001 — Email verification email never sent ✅ FIXED
- **Impact:** Users registered with `PENDING_VERIFICATION` status but received only a generic welcome email with no verification link; `/verify-email` flow unusable.
- **Root cause:** `register()` called `sendWelcomeEmail()` without including the verification token.
- **Fix:** Added `EmailService.sendVerificationEmail()` and call it from `AuthService.register()`.

### AUTH-C002 — MFA login always failed ✅ FIXED
- **Impact:** Users with MFA enabled could never complete login.
- **Root cause:** `findUserByEmail()` did not select `mfaSecret` (column has `select: false`).
- **Fix:** Added `mfaSecret` to explicit select list in repository.

### AUTH-C003 — Refresh token flow broken without x-tenant-id header ✅ FIXED
- **Impact:** Token refresh failed when frontend did not send tenant header (common on `/auth/refresh`).
- **Root cause:** `refreshTokens()` used header `tenantId` to look up user instead of JWT payload `tenantId`.
- **Fix:** Use `payload.tenantId` as source of truth; validate header match when provided.

### AUTH-C004 — Refresh tokens not rotated ✅ FIXED
- **Impact:** Stolen refresh tokens remained valid after refresh (replay attack).
- **Root cause:** New tokens issued without revoking the consumed refresh token.
- **Fix:** `revokeRefreshTokenByRawToken()` called before issuing new tokens; frontend stores rotated refresh token.

### AUTH-C005 — Logout did not invalidate refresh token ✅ FIXED
- **Impact:** "Logout" left refresh tokens valid; sessions could be resumed.
- **Root cause:** `logout()` only revoked tokens when `allSessions=true`.
- **Fix:** Accept optional `refreshToken` in `LogoutDto`; frontend sends cookie value on logout.

### AUTH-C006 — New registrations had no RBAC role ✅ FIXED
- **Impact:** Registered users had empty `roles[]` and `permissions[]` in JWT; `@Roles('TENANT_ADMIN')` routes returned 403.
- **Root cause:** `register()` and OAuth signup did not assign roles.
- **Fix:** `bootstrapTenantAdminRole()` creates TENANT_ADMIN role and assigns it to the registering user.

### AUTH-C007 — Session revoke lacked ownership check ✅ FIXED
- **Impact:** Any authenticated user could revoke any session ID within tenant if UUID guessed.
- **Root cause:** `deactivateSession()` filtered by session ID + tenant only.
- **Fix:** Require matching `userId` on session deactivation.

### AUTH-C008 — OAuth tokens exposed in URL query string ✅ FIXED
- **Impact:** Access/refresh tokens logged in server/proxy/browser history.
- **Root cause:** `redirectWithTokens()` used query parameters.
- **Fix:** Redirect to URL hash fragment; frontend callback reads hash first.

### AUTH-C009 — Password reset/change did not invalidate sessions ✅ FIXED
- **Impact:** Compromised sessions remained active after credential change.
- **Fix:** `resetPassword()` and `changePassword()` now revoke all refresh tokens and deactivate sessions.

---

## High-Priority Gaps (Open)

### AUTH-H001 — SSO backend not implemented
- **Evidence:** `frontend/src/app/(app)/settings/workspace/sso/page.tsx` saves settings to tenant config; no SAML/OIDC passport strategy or `/auth/sso/*` endpoints.
- **Remediation:** Implement SAML/OIDC strategies per tenant settings; add ACS/callback routes.

### AUTH-H002 — HS256 default in production
- **Evidence:** `jwt.config.ts` defaults to HS256 unless `JWT_ALGORITHM=RS256` or key pair provided.
- **Remediation:** TASK-017 — enforce RS256 in production via env validation at startup.

### AUTH-H003 — PermissionGuard default-allow on undecorated routes
- **Evidence:** `permission.guard.ts` returns `true` when no `@Permissions` or `@ResourcePermissions` metadata.
- **Impact:** Users with empty permissions can access undecorated tenant routes.
- **Remediation:** TASK-010 — default-deny or complete decorator coverage.

### AUTH-H004 — Forgot-password requires tenant scoping
- **Evidence:** `forgotPassword(email, tenantId)` scopes lookup to tenant when header present; users on multi-tenant email setups may not receive reset if wrong tenant header.
- **Remediation:** Lookup by email globally (like login without tenant header), or add tenant slug to forgot-password form.

### AUTH-H005 — MFA disable has no re-authentication
- **Evidence:** `DELETE /auth/mfa` disables MFA with JWT only; no password/TOTP confirmation.
- **Remediation:** Require current password or valid TOTP before disable.

### AUTH-H006 — Legacy duplicate auth files
- **Evidence:** `backend/src/auth.service.ts`, `backend/src/auth.controller.ts`, `backend/src/auth.repository.ts` duplicate module paths.
- **Remediation:** TASK-030 — remove legacy duplicates.

### AUTH-H007 — Integration tests excluded from Jest
- **Evidence:** `testPathIgnorePatterns` excludes `/test/integration/`; auth HTTP E2E not run in CI by default.
- **Remediation:** Add auth integration suite to CI with real guards (TASK-020).

---

## Medium-Priority Gaps

| ID | Issue | Notes |
|----|-------|-------|
| AUTH-M001 | Expired refresh tokens not purged | DB grows; add cleanup job |
| AUTH-M002 | `expiresIn` hardcoded to 900 in token response | Should derive from JWT config |
| AUTH-M003 | Session `userAgent` hardcoded | Should capture from request headers |
| AUTH-M004 | Register password strength weaker on frontend | Backend requires uppercase/special; frontend only min 8 |
| AUTH-M005 | OAuth provider credentials optional | Strategies throw at boot if misconfigured |
| AUTH-M006 | No rate limit on `/auth/forgot-password` | Enumeration/abuse risk (global throttler may partially cover) |
| AUTH-M007 | Cross-tenant HTTP isolation tests missing | TASK-021 |

---

## Architecture Review

### JWT & Refresh Tokens

```
Login/Register/OAuth
       │
       ▼
 generateTokens()
       ├── signJwtToken(access)  — RS256 or HS256
       ├── signJwtToken(refresh) — HS256 with refresh secret
       ├── saveRefreshToken(bcrypt hash)
       └── createSession()
```

- Access tokens carry: `sub`, `email`, `tenantId`, `roles`, `permissions`, `planId`
- Refresh tokens verified with separate secret; stored as bcrypt hash
- **Rotation:** consumed refresh token revoked before new pair issued (fixed)

### Global Guard Chain (`app.module.ts`)

| Guard | Order | Auth relevance |
|-------|-------|----------------|
| MultiLevelThrottlerGuard | 1 | Brute-force mitigation |
| JwtAuthGuard | 2 | Bearer validation; `@Public()` bypass |
| TenantGuard | 3 | JWT tenantId required; header must match |
| RolesGuard | 4 | `@Roles()` enforcement |
| PermissionGuard | 5 | `@Permissions()` / `@ResourcePermissions()` |
| FeatureGuard | 6 | Plan feature gates |
| PlanGuard | 7 | Subscription checks |
| LimitGuard | 8 | Usage limits |

### Tenant Isolation

- Users scoped by `(email, tenantId)` unique index
- All auth repository queries include `tenantId`
- TenantGuard overwrites `x-tenant-id` header with JWT value post-auth
- Refresh uses JWT `tenantId` (fixed) — no longer depends on client header

### RBAC

- Roles and permissions loaded at token generation from `user_roles` → `roles` → `permissions`
- New tenants receive `TENANT_ADMIN` with all non-admin permissions (fixed)
- `@Roles('SUPER_ADMIN')` bypasses permission checks in PermissionGuard

### Session Management

- Sessions tracked in `sessions` table with `isActive`, `expiresAt`, `ipAddress`
- Refresh tokens optionally linked via `sessionId`
- Logout revokes refresh token (fixed); `allSessions` revokes all
- Password change/reset invalidates all sessions (fixed)

### 2FA (TOTP)

- `MfaService` uses `otplib` for secret generation and verification
- Login requires `mfaCode` when `isMfaEnabled=true`
- Frontend `/mfa` page stores pending credentials in zustand persist
- Enable flow: generate secret → verify TOTP → set `isMfaEnabled=true`

### OAuth

- Providers: Google, GitHub, Facebook, Apple (Passport strategies)
- Auto-provisions tenant + user on first OAuth login
- Links provider to existing email account
- Callback redirects to frontend hash with tokens (fixed)

### SSO

- **Status:** UI-only. No SAML/OIDC backend implementation.

---

## Test Coverage

| Test file | Type | Runs in CI | Coverage |
|-----------|------|------------|----------|
| `test/integration/auth.integration.spec.ts` | Unit (mocked) | ❌ Ignored | Login rejection only |
| `test/integration/auth-login-http.integration.spec.ts` | HTTP E2E | ❌ Ignored | Login success/failure |
| `test/e2e/helpers/auth-test.helper.ts` | Helper | — | Login + header builder |

**Recommended additions:**
1. Register → verify email → login E2E
2. Refresh token rotation E2E
3. Logout revokes refresh token E2E
4. MFA login E2E
5. Cross-tenant token rejection E2E
6. Password reset full flow E2E

---

## Files Modified (Fixes Applied)

| File | Change |
|------|--------|
| `backend/src/shared/email/email.service.ts` | Added `sendVerificationEmail()` |
| `backend/src/modules/auth/auth.service.ts` | Verification email, role bootstrap, refresh rotation, logout/password/session fixes |
| `backend/src/modules/auth/auth.repository.ts` | MFA select, refresh rotation helpers, tenant admin bootstrap, session ownership |
| `backend/src/modules/auth/auth.controller.ts` | Logout refreshToken param, OAuth hash redirect |
| `backend/src/modules/auth/auth.module.ts` | Permission entity registration |
| `backend/src/modules/auth/dto/auth.dto.ts` | `refreshToken` on LogoutDto |
| `frontend/src/services/auth.service.ts` | Logout sends refresh token |
| `frontend/src/lib/api/client.ts` | Refresh rotation + tenant header |
| `frontend/src/hooks/use-auth.ts` | Extract tenantId from JWT on login |
| `frontend/src/app/auth/callback/page.tsx` | Hash fragment token parsing |

---

## Production Readiness Assessment

| Area | Score | Notes |
|------|-------|-------|
| Core auth flows | **8/10** | Register/login/reset/verify/MFA functional after fixes |
| Token security | **7/10** | Rotation fixed; RS256 not default; OAuth hash fixed |
| RBAC | **6/10** | Role bootstrap fixed; PermissionGuard gaps remain |
| Tenant isolation | **8/10** | Strong JWT + guard model; cross-tenant tests needed |
| Session management | **7/10** | Revocation improved; cleanup job missing |
| 2FA | **7/10** | TOTP works; disable lacks re-auth |
| OAuth | **6/10** | Implemented; provider config required per env |
| SSO | **2/10** | UI only, no backend |
| Test coverage | **4/10** | Minimal; integration tests excluded from CI |
| **Overall** | **B / 6.5–7/10** | Safe for staging; address H001–H003 before production |

### Pre-Production Checklist

- [x] Email verification email delivered with token link
- [x] MFA login functional
- [x] Refresh token rotation enabled
- [x] Logout invalidates refresh token
- [x] New tenants receive TENANT_ADMIN role
- [x] Password reset invalidates existing sessions
- [x] OAuth tokens not in query string
- [ ] Enforce RS256 in production (`JWT_ALGORITHM=RS256`)
- [ ] Complete PermissionGuard coverage (TASK-010)
- [ ] Implement SAML/OIDC SSO backend
- [ ] Add auth E2E suite to CI
- [ ] Remove legacy auth duplicate files (TASK-030)
- [ ] MFA disable requires re-authentication
- [ ] Align frontend password validation with backend rules

---

## References

- `backend/src/modules/auth/` — canonical auth module
- `backend/src/common/guards/` — global guard implementations
- `frontend/src/app/(auth)/` — auth pages
- `project-audit/SECURITY_AUDIT_REPORT.md` — platform security context
- `tasks/TASKS.md` — TASK-010, TASK-017, TASK-020, TASK-021, TASK-030
