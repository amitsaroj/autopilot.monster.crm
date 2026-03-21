# Limits Runtime
Project: autopilot.monster.crm

---

## 1. The Guard
The `LimitGuard` executes at the highest layer of the NestJS request lifecycle.

```typescript
@UseGuards(LimitGuard('max_custom_fields'))
@Post('/crm/fields')
async createCustomField() {
  // Guard has already executed. We know it's safe to insert.
  return this.fieldService.create();
}
```

## 2. Real-time Counting vs State Caching

For entities that change rarely (`max_pipelines`, `max_users`), the system performs a live `COUNT(*)` query during the action.

```typescript
// Inside LimitGuard for hard counts
const currentCount = await this.repo.count({ tenantId });
if (currentCount >= limitAllowed) {
  throw new ForbiddenException('Upgrade your plan to add more.');
}
```

For highly volatile limits (e.g., `ai_messages_daily_limit`), we rely entirely on the Redis Token Bucket.

## 3. Bypassing Limits internally
When the system itself does an action (e.g., creating a Contact during an AI conversation or syncing data via a Webhook), it bypasses the HTTP Guard layer. However, the internal Service layer (*Thick Backend Rule*) still checks the quota cache before executing `repo.save()` to ensure background jobs don't silently eat infinite overage.
