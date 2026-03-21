# Plan Middleware
Project: autopilot.monster.crm

---

## 1. Plan Enrichment Middleware

The `PlanEnrichmentMiddleware` physically attaches the normalized ruleset of a Plan onto the Request object, so that downstream controllers do not need to query the database.

It sits right behind the Auth system.

```typescript
@Injectable()
export class PlanMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.tenant) return next();

    // 1. Fetch Plan details from Redis cache
    const plan = await this.cache.get(`plan:${req.tenant.planId}`);
    
    // 2. Fetch active feature toggles and overrides
    const features = await this.cache.get(`features:${req.tenant.id}`);

    // 3. Attach standard context
    req.pricingContext = {
      name: plan.name,
      features: features,
      limits: plan.limits
    };

    next();
  }
}
```

## 2. Why middleware instead of a Service?
If we injected a `PricingService` into 50 different controllers, it creates massive boilerplate. Since the limits and features are required universally, hydrating them directly on the `req` object follows standard Fastify/Express data-flow design.
