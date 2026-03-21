# Usage & Billing Synchronization Flow
Project: autopilot.monster.crm

---

## 1. High Velocity Counting

AutopilotMonster processes millions of LLM tokens, API calls, and Webhook deliveries. We cannot update PostgreSQL rows for every single metered action.

**The Fast Path:**
1. Event occurs (e.g., `ai.message.sent`, tokens: 492).
2. Service calls `PricingService.trackUsage(tenantId, 'ai_tokens', 492)`.
3. Action instantly pushes to Redis:
   `HINCRBY tenant:usage:123 ai_tokens 492`
4. The Redis call takes < 1ms. Fast path complete.

---

## 2. Slow Sync (The Flusher)

Every 5 minutes, a BullMQ `UsageFlusherWorker` executes globally.
1. It scans all Redis `tenant:usage:*` keys.
2. It fetches the integer increments.
3. It performs a massive bulk PostgreSQL `UPSERT`:
   `UPDATE usage_records SET consumed = consumed + $X WHERE tenant_id = $Y AND metric = $Z;`
4. It zeroes out the exact delta it processed safely in Redis.

## 3. Stripe Metered Sync

Once every 24 hours, the `StripeMeterSyncWorker` looks at the delta in PostgreSQL for "Billable Overage", and calls `stripe.billingPortal.reportUsage(...)` to push the final financial liability down to the payment processor. 

This ensures Stripe always has an accurate rolling tally of the customer's impending bill, preventing surprise $5,000 invoices at the end of the month without any warning.
