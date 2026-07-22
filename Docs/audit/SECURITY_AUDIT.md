# SECURITY AUDIT

**Audit date:** 2026-07-22  
**Agent:** 15 — Production Readiness Auditor (post Wave 4)  
**Scope:** Auth, RBAC, audit, secrets, admin surface, webhook verification

---

## Executive summary

| Area | Status | Risk |
|------|--------|------|
| Auth (JWT/MFA/OAuth) | 🟡 Partial | Medium |
| RBAC enforcement | 🟡 Partial | Medium |
| Audit logging | 🟡 Partial | **High** (CRM gap) |
| Secrets hygiene | 🟡 Partial | **High** (git history) |
| Admin API auth | 🟡 Partial | Low (remediated) |
| Webhook signatures | 🟡 Partial | Medium |
| Legacy auth duplication | 🟡 Remediated | Low (F-004 fixed) |

**Production-ready:** No — CRM audit gap + secrets history + incomplete FE test coverage.

---

## Wave 4 fixes (verified)

### F-004 — Legacy auth tree removed

| Item | Status |
|------|--------|
| Duplicate `backend/src/auth.module.ts` | ✅ Absent (glob 0 files) |
| Single auth path | ✅ `modules/auth/*` only |
| Import confusion risk | ✅ Reduced |

**Verdict:** 🟡 Partial — code hygiene fixed; RS256 prod key material still ops-dependent.

---

## Wave 1 fixes (verified)

### BL-C01 — Audit log write path (partial fix)

| Item | Status |
|------|--------|
| `AuditLog` in `PlatformModule.forFeature` | ✅ Verified |
| `AuditLogListener` registered | ✅ Verified |
| Domain event → audit for auth/tenant/RBAC | ✅ 16+ handlers in `audit-log.listener.ts` |
| Direct `audit.log` emitters in CRM services | ❌ None found |
| CRM mutation audit | ❌ Not implemented |

**Verdict:** 🟡 Partial — compliance path exists for identity/RBAC; CRM still silent.

### BL-C03 — Secrets hygiene (partial fix)

| Item | Status |
|------|--------|
| `git rm --cached` for prod env files | ✅ Staged (not committed) |
| `.env.*.example` templates | ✅ Added |
| `DB_SYNCHRONIZE=false` in prod example | ✅ Verified |
| Secrets in git **history** | ❌ Still present — rotate + history rewrite needed |
| Root `.env.example` | ✅ Added |

**Verdict:** 🟡 Partial — index clean pending commit; history risk remains.

### BL-C06 — Users groups route

| Item | Status |
|------|--------|
| `@Get('groups')` before `@Get(':id')` | ✅ Line 60 before 129 |

**Verdict:** 🟡 Partial (API fixed).

### BL-C07 — Admin unauthenticated fetch

| Item | Status |
|------|--------|
| `fetch('/api/v1/...')` in admin/superadmin | ✅ **0 matches** (Agent 15 verified) |
| Migrated to axios `api` client | ✅ 33 pages (Agent 4) |

**Verdict:** 🟡 Partial — auth header present; page-level permission QA still open.

### BL-C11 — RBAC FE hubs

| Item | Status |
|------|--------|
| RolesGuard stub comment | ✅ Removed |
| `admin/rbac/page.tsx` fake stats | ❌ Hardcoded counts |
| PermissionGuard on controllers | ✅ Present on CRM/omnichannel/developer/etc. |

**Verdict:** 🟡 Partial — BE enforcement OK; FE misleads operators.

### BL-C12 — RS256 production JWT

| Item | Status |
|------|--------|
| `jwt.config.ts` enforces RS256 in prod | ✅ Code verified |
| Real key pair in deploy secrets | ❌ Ops not verified |
| Refresh tokens HS256 by design | ℹ️ Documented |

**Verdict:** 🟡 Partial — code OK; deploy verification pending.

---

## Developer / marketplace security (Wave 4)

| Module | Guards | Status |
|--------|--------|--------|
| `DeveloperModule` webhooks/OAuth/logs | `@ResourcePermissions('settings')` + `@Roles('TENANT_ADMIN')` | ✅ Wired |
| `MarketplaceTemplateController` | `@ResourcePermissions('marketplace')` + role checks | ✅ Wired |
| OAuth token endpoint | `@Public()` on `/developer/oauth/token` | 🟡 Expected; needs E2E test |

---

## Webhook security

| Integration | Signature verify | Status |
|-------------|------------------|--------|
| Meta WhatsApp | HMAC `x-hub-signature-256` | ✅ Wired; prod secret ops pending |
| Stripe billing | Raw body + webhook secret | ✅ Wired (Agent 10) |
| Twilio voice | Twilio signature (partial) | 🟡 Callback paths fixed (Agent 7) |

---

## Top security blockers

| # | Blocker | Severity |
|---|---------|----------|
| 1 | CRM audit emitters missing (BL-C01) | High |
| 2 | Secrets in git history (BL-C03) | High |
| 3 | RBAC FE misleading stats (BL-C11) | Medium |
| 4 | RS256 key material not verified in prod (BL-C12) | Medium |
| 5 | OAuth developer flows untested E2E | Medium |

---

## Recommendations

1. Emit `audit.log` from contact/deal/lead/company service mutations  
2. Commit env untrack + rotate any real credentials from history  
3. Wire RBAC admin page to `/rbac/stats` or remove fake KPIs  
4. Add integration tests for developer OAuth authorize/token flow  
5. Verify Meta webhook signature in staging with real app secret  

**Security sign-off:** Not ready for production.
