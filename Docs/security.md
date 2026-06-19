# Security & Compliance Design
Project: autopilot.monster.crm

---

## 1. Authentication

### 1.1 JWT & Sessions
- **Access Tokens:** Short-lived JWTs (15 minutes). Signed using RS256 with asymmetric key pairs when `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` are set; HS256 is permitted only in non-production environments.
- **Refresh Tokens:** Opaque, high-entropy tokens (30 days). Stored hashed (bcrypt) in the DB `sessions` table alongside IP and User-Agent.
- **Session Revocation:** Changing password or logging out revokes the specific refresh token. "Log out all devices" revokes all sessions for the user.

#### RS256 Key Configuration & Rotation

Production **requires** RS256. Set these environment variables:

| Variable | Purpose |
|----------|---------|
| `JWT_ALGORITHM` | Set to `RS256` (auto-selected when key pair is present) |
| `JWT_PRIVATE_KEY` | PEM-encoded RSA private key (signing) |
| `JWT_PUBLIC_KEY` | PEM-encoded RSA public key (verification) |
| `JWT_SECRET` | HS256 fallback secret (non-production only) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |

**Key generation (4096-bit RSA):**
```bash
openssl genrsa -out jwt-private.pem 4096
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
```

**Rotation procedure:**
1. Generate a new RSA key pair.
2. Deploy the new `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` to all API instances simultaneously (rolling restart acceptable; old tokens remain valid until expiry because verification uses the public key).
3. For zero-downtime rotation with overlapping validity, maintain a `JWT_PUBLIC_KEYS` comma-separated list of active public keys (future enhancement); current implementation uses a single key pair.
4. Access tokens expire in 15 minutes; after rotation, all clients receive new tokens on next refresh.
5. Optionally revoke all refresh tokens via admin endpoint to force re-authentication after compromise.

Implementation: `backend/src/config/jwt.config.ts`, `backend/src/common/utils/jwt-signing.util.ts`. Production startup throws if HS256 is attempted without key pair.

### 1.2 Multi-Factor Auth (MFA)
- Supports TOTP (Google Authenticator, Authy).
- Recovery codes provided on setup.
- Enforced optional or mandatory at the tenant level.

### 1.3 Social Login (OAuth2)
- Supports Google, GitHub, Facebook, and Apple.
- Automatic account linking via verified email.
- New accounts automatically onboarded to a dedicated tenant.

---

## 2. API Security

### 2.1 Rate Limiting (Redis)
Strict rate limits applied globally per tenant/IP to prevent abuse:
- Public endpoints: 10 req/min/IP
- Auth endpoints: 5 req/min/IP (brute-force protection)
- Authenticated endpoints: 200 req/min/tenant
- Bulk API endpoints: 10 req/hour/tenant

### 2.2 Input Validation
- All inputs validated using `class-validator` and `class-transformer` in NestJS DTOs.
- `ValidationPipe` drops unknown properties (`whitelist: true`) and strictly enforces types.

### 2.3 CORS & Headers
- Helmet.js applied for secure HTTP headers (HSTS, NoSniff, XSS Filter).
- CORS strictly limited to allowed frontend domains (`app.autopilot.monster`).

### 2.4 Zero Trust Implementation
- **Edge Layer**: Next.js Middleware verifies session cookies before serving components.
- **API Layer**: NestJS Guards (Auth, Tenant, Role, Plan, Limit) intercept every request.
- **DB Layer**: Repository patterns automatically inject `tenantId` into every query.

---

## 3. Data Protection

### 3.1 Encryption at Rest
- Database storage is encrypted at the volume level (AWS KMS / LUKS).
- Sensitive fields (API secrets, OAuth tokens) encrypted at the application level using AES-256-GCM before DB saving.

### 3.2 Encryption in Transit
- Strict TLS 1.3 everywhere. No unsecured HTTP traffic allowed.
- Internal microservices communicate over encrypted VPC networks.

---

## 4. Role Based Access Control (RBAC)

- Extensible permission matrix using `resource:action` format (e.g., `deal:delete`).
- `RoleGuard` and `PermissionGuard` enforce checks at the controller/route level.
- Custom roles defined per tenant.

---

## 5. Audit Logging

A core component of Enterprise SaaS is tracking "Who did what and when."

### 5.1 Audit Log Structure
```json
{
  "tenantId": "uuid",
  "userId": "uuid",
  "action": "DEAL_DELETED",
  "resourceType": "Deal",
  "resourceId": "uuid",
  "oldData": { "status": "OPEN", "value": 5000 },
  "newData": { "status": "DELETED" },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

### 5.2 Implementation
An `AuditInterceptor` automatically intercepts all `POST`, `PATCH`, `PUT`, `DELETE` requests that modify core entities, queues an async job, and writes the diff to the `audit_logs` table. This allows admins to query comprehensive change history.
