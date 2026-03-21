# Scheduler System Architecture
Project: autopilot.monster.crm

---

## 1. Overview
The Scheduler system is responsible for triggering time-based events. Instead of relying on raw OS `cron` jobs (which run on a single instance and don't scale), AutopilotMonster uses **BullMQ Repeatable Jobs** backed by Redis. This ensures high availability, distributed execution, and no duplicate runs.

---

## 2. Core Scheduler Architecture

```
Scheduler Service (API Node, on boot)
    │
    ▼ (registers repeatable definitions)
Redis BullMQ Scheduler Queue
    │
    ▼ (Internal BullMQ logic moves delayed jobs to active based on timestamp)
Worker Process 1          Worker Process 2 (idle)
    │
    ▼
Executes Job (e.g. 'nightly_billing_run')
    │
    ▼
Updates DB / Emits Events
```

---

## 3. Registered Cron Jobs

| Job Name | Schedule (UTC) | Description |
|---|---|---|
| `subscription_charge` | `0 0 * * *` (Daily Midnight) | Scans for subscriptions renewing today, creates invoices, charges Stripe. |
| `usage_counters_flush`| `*/15 * * * *` (Every 15s) | Takes Redis usage counters (incremented in memory) and persists them to `usage_records` table in PostgreSQL. |
| `soft_delete_cleanup` | `0 3 * * *` (Daily 3 AM) | Hard deletes records where `deleted_at < NOW - 30 days`. |
| `analytics_materialize`| `0 1 * * *` (Daily 1 AM) | Aggregates previous day's data into materialized views for fast dashboard loading. |
| `campaign_dispatcher` | `* * * * *` (Every minute) | Checks `voice_campaigns` and `whatsapp_broadcasts` for `scheduled_at <= NOW()` and moves them to `SENDING` state. |
| `trial_expiry_check` | `0 8 * * *` (Daily 8 AM) | Warns users if trial expires in 3 days, or suspends if trial expired. |
| `kb_sync_refresh` | `0 * * * *` (Every hour) | Iterates over Knowledge Bases with dynamic sources (URLs) and re-syncs them. |

---

## 4. Job Implementation Example

```typescript
// Registration (on module init)
await this.schedulerQueue.add(
  'subscription_charge',
  {},
  { repeat: { cron: '0 0 * * *' }, jobId: 'daily_sub_charge' } // Fixed jobId prevents duplicates
);

// Worker Processor
@Processor('scheduler')
export class SchedulerProcessor {
  async process(job: Job) {
    switch (job.name) {
      case 'subscription_charge':
        return this.billingService.processDailyCharges();
      case 'campaign_dispatcher':
        return this.campaignService.dispatchScheduled();
      // ...
    }
  }
}
```

---

## 5. End-User Scheduling (Workflows & Campaigns)

Users can schedule their own events (e.g., "Delay 3 days" in a workflow, or "Send WhatsApp broadcast tomorrow at 9 AM").

These do **not** use cron syntax. Instead, they use BullMQ's native `delay` parameter.

- **Workflow Wait Step:** 
  The worker pauses execution and pushes a job back onto the queue:
  `workflowQueue.add('execute-step-2', data, { delay: 3 * 24 * 60 * 60 * 1000 })`

- **Scheduled Campaign:**
  When user clicks "Schedule", the API calculates milliseconds until target date and adds the delay.
  `campaignQueue.add('start', campaign, { delay: msUntilScheduled })`

This avoids constantly polling the database to ask "Is it time yet?" and relies on Redis's heavily optimized internal timer wheel.
