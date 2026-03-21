# Pricing Middleware / Runtime Environment
Project: autopilot.monster.crm

---

## 1. Injecting Billing State
Because checking plan limits and features requires database hits, we inject the "Tenant Pricing Context" early in the Request Lifecycle to avoid redundant queries during complex operations.

## 2. PricingContextInterceptor
This globally bound interceptor:
1. Detects `Req.tenant.id`.
2. Pulls the tenant's exact feature flags and active limit caps (from Redis).
3. Attaches them to `Req.pricingContext`.

```typescript
export interface PricingContext {
  activePlanId: string;
  isCustomDeal: boolean;
  features: string[]; // e.g. ['voice_calls', 'ai_agents']
  limits: Record<string, number>; // e.g. { active_workflows: 5 }
  usage: Record<string, number>;
}
```

## 3. Safe Degradation
If Redis fails entirely and `PricingContext` cannot load:
- Base CRM functions (`crm:read`, `crm:write`) fail open (allowing tenant to continue working).
- Rate limits fail wide (allow traffic).
- Metered usages (AI, Voice) fail **CLOSED** (to prevent accidental massive external API spend).
