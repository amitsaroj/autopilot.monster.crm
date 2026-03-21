# Pricing Limits Runtime Enforcement
Project: autopilot.monster.crm

---

## 1. Overview
Limits checking happens tens of thousands of times a minute. It cannot rely on PostgreSQL `COUNT(*)` queries. We use a **Redis Token Bucket** algorithm integrated with `@nestjs/throttler`.

---

## 2. Redis Structure
- **Usage Key:** `usage:tenant_id:{metric}:current_month`
- **Limit Key:** `limit:tenant_id:{metric}`

Both are read simultaneously via a Redis `MULTI` / `MGET` pipeline.

---

## 3. The Limit Guard

```typescript
@Injectable()
export class LimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metric = this.reflector.get<string>('limit', context.getHandler());
    if (!metric) return true;

    const req = context.switchToHttp().getRequest();
    const allowed = await this.redisScriptService.checkAndIncrementLimit(
      req.tenant.id, 
      metric
    );

    if (!allowed) {
      throw new HttpException({
        status: 402,
        error: 'PAYMENT_REQUIRED',
        message: `Plan limit exceeded for metric: ${metric}`
      }, HttpStatus.PAYMENT_REQUIRED);
    }
    return true;
  }
}
```

## 4. Atomic Lua Scripts
To prevent race conditions (e.g., 50 concurrent API calls all seeing usage is below limit and all inserting a contact), the check-and-increment happens via an atomic Lua script parsed by Redis.
