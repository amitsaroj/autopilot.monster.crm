# Event Bus & Worker System Design
Project: autopilot.monster.crm

---

## 1. Event-Driven Architecture Overview
The platform decouples distinct domains (CRM, Billing, Notifications, Workflows) using an internal pub/sub **Event Bus** (using NestJS EventEmitter) for synchronous in-memory events, and **BullMQ** for persistent, distributed asynchronous background jobs.

---

## 2. Internal Event Bus

### 2.1 Emitting Events
When a core action happens, the domain service emits an event instead of directly calling other services.

```typescript
@Injectable()
export class DealService {
  async markAsWon(dealId: string) {
    const deal = await this.repo.markWon(dealId);
    this.eventEmitter.emit('crm.deal.won', { 
      tenantId: deal.tenantId, 
      dealId: deal.id, 
      value: deal.value 
    });
  }
}
```

### 2.2 Subscribing to Events
Other modules listen and react silently.

```typescript
@Injectable()
export class WorkflowTriggerListener {
  @OnEvent('crm.deal.won', { async: true })
  async handleDealWon(payload: DealWonPayload) {
    // Queries workflows configured for 'DEAL_WON' trigger
    // Pushes matched workflows onto the execution BullMQ
  }
}
```

---

## 3. Worker System (BullMQ)

For heavy tasks, network requests, or operations needing retry logic, the system relies on Redis-backed BullMQ queues. 

### 3.1 Queue Definitions

| Queue Name | Concurrency | Priority Levels | Purpose |
|---|---|---|---|
| `emails` | 20 | Normal, High | SMTP sending |
| `webhooks` | 50 | Normal | Delivering outbound hooks to client servers |
| `workflows` | 10 | Low, Normal | Step-by-step automation execution |
| `ai_inference`| 5 | Normal | LLM API calls, embeddings |
| `data_import` | 2 | Low | Parsing/inserting large CSV files |
| `usage_flush` | 5 | High | Syncing Redis usage counters to DB |

### 3.2 Worker Architecture
The API server primarily *adds* jobs. In large deployments, a completely separate process (Worker Node) runs the BullMQ processors to prevent intensive jobs (like data-import or running AI) from blocking the main API HTTP loop.

### 3.3 Retry & Dead Letter Queue
- **Retry Strategy:** Most queues use Exponential Backoff (e.g., fail → wait 2s → fail → wait 4s → fail → wait 8s).
- **Dead Jobs:** Jobs that exhaust all retries are marked as `FAILED`.
- Failed Webhooks emit a `system.webhook.failed` event which triggers an alert to the Tenant admin.

---

## 4. Scheduler (Cron)

BullMQ Repeatable Jobs act as the cron engine.

| Scheduled Job | Frequency | Purpose |
|---|---|---|
| `daily_usage_reset` | Midnight | Resets daily plan quotas |
| `subscription_charge` | Daily | Checks for subscriptions due for Stripe charge |
| `scheduled_campaigns` | Minutely | Unpacks voice/WA campaigns set to run 'now' |
| `soft_delete_cleanup` | Nightly | Hard deletes rows where `deleted_at` > 30 days |
