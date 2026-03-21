# Retry Strategy & Idempotency
Project: autopilot.monster.crm

---

## 1. Idempotency on External API Calls
To prevent double-charging credit cards or sending duplicate emails if the NestJS worker crashes mid-task, we implement strict idempotency keys.

Every HTTP request to an external mutating API (Stripe, Twilio, SendGrid) includes the `job.id` from BullMQ as the `Idempotency-Key` or `X-Request-Id` header.

## 2. Exponential Backoff (BullMQ)
For background tasks touching external APIs:

```typescript
{
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000 // 2s, 4s, 8s, 16s, 32s
  }
}
```

## 3. Specific Error Handling
- **429 Too Many Requests:** Extract the `Retry-After` header. Pause the BullMQ job explicitly using `job.moveToDelayed(retryAfterMs)`.
- **4xx Client Errors:** Do **not** retry. Log error, move job to Failed State. (e.g., trying to charge a missing card, or SMSing an invalid number will never succeed on retry).
- **5xx Server Errors / ETIMEDOUT:** Attempt exponential backoff retry. If max attempts exhausted, alert SRE channel.
