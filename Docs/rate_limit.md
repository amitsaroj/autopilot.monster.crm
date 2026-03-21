# Rate Limiting Design
Project: autopilot.monster.crm

---

## 1. Overview
Rate limiting protects the API from abuse, accidental DDoS from faulty customer scripts, and manages infrastructure load. It is implemented at both the **Edge (Nginx/Cloudflare)** and the **Application (NestJS/Redis)** layers.

---

## 2. Layers of Protection

### 2.1 Layer 1: Edge (Nginx/Cloudflare)
- **Scope:** Global per IP address.
- **Limit:** 10,000 requests / 5 minutes / IP.
- **Action:** 429 Too Many Requests, handled entirely by edge before hitting NestJS.
- **Purpose:** Prevent volumetric DDoS attacks.

### 2.2 Layer 2: Auth Endpoints (NestJS)
- **Scope:** Global per IP address.
- **Endpoints:** `/auth/login`, `/auth/forgot-password`
- **Limit:** 5 requests / 1 minute / IP.
- **Purpose:** Prevent credential stuffing and brute force password attacks.

### 2.3 Layer 3: Tenant API Rate Limit (NestJS + Redis)
- **Scope:** Per Tenant + Request Path category.
- **Limit:** Varies by plan and tier (see below).
- **Purpose:** Prevent one heavy tenant from degrading database performance for others ("Noisy Neighbor").

---

## 3. Tenant Rate Limits

Implemented using a Sliding Window algorithm in Redis (`@nestjs/throttler` backed by `ioredis`).

| Category | Endpoints | Starter Plan | Pro Plan | Enterprise Plan |
|---|---|---|---|---|
| **Standard API** | `GET /crm/*`, `POST /crm/*` | 100 req / min | 300 req / min | 1,000 req / min |
| **Heavy API** | Analytics, Exports | 10 req / min | 30 req / min | 100 req / min |
| **Bulk Import** | `/import` | 5 req / hour | 10 req / hour | 50 req / hour |
| **Webhooks In** | Meta, Stripe inbound | Unlimited | Unlimited | Unlimited |

---

## 4. Throttle Guard Implementation

```typescript
// Extends standard ThrottlerGuard to use Plan context
@Injectable()
export class TenantRateLimitGuard extends ThrottlerGuard {
  async getTracker(req: Record<string, any>): Promise<string> {
    // Track by tenant_id instead of IP address for authenticated requests
    return req.tenant?.id || req.ip; 
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const req = context.switchToHttp().getRequest();
    if (!req.tenant) return super.getLimit(context); // Fallback to default config IP limit

    // Dynamically fetch limit based on tenant's plan
    // This calls pricing service to get limit (cached in Redis)
    return this.pricingService.getRateLimitOption(req.tenant.id, 'STANDARD_API');
  }
}
```

---

## 5. Client Headers
When a rate limit is active, the API returns standard headers to allow the client to throttle itself:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1700000060

HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000060
Retry-After: 12
```

---

## 6. Webhook Delivery Limiting
For *outbound* webhooks (our system calling a customer's server), we use BullMQ's built-in rate limiter.
If we need to deliver 5,000 `deal.created` webhooks to `customer-server.com`, we limit the BullMQ queue processor:
```typescript
const webhookQueue = new Queue('webhooks', {
  limiter: {
    max: 50, // max 50 jobs
    duration: 1000 // per 1 second
  }
});
```
This protects the customer's server from being DDoS'd by our own Event Bus.
