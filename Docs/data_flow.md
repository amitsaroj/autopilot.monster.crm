# Data Flow Design
Project: autopilot.monster.crm

---

## 1. Overview
This outlines the standard data flow patterns across AutopilotMonster, distinguishing between Synchronous Flows (API Requests), Asynchronous Flows (Background Workers), and Stream Flows (Webhooks/Events).

---

## 2. Core API Request Flow (Synchronous)

Example: **Creating a Deal**

```
Client (Next.js)
  │ POST /v1/crm/deals { name, value, pipelineId }
  ▼
Nginx (Edge)
  │ adds x-real-ip, rates limit check
  ▼
API Gateway (NestJS)
  │
  ├── 1. Middleware: parses x-tenant-id
  ├── 2. AuthGuard: validates JWT
  ├── 3. TenantGuard: ensures tenant is ACTIVE
  ├── 4. PermissionGuard: checks 'crm:write'
  ├── 5. ValidationPipe: validates DTO body
  │
  ▼
DealsController
  │
  ▼
DealsService.create()
  │
  ├── 1. looks up pipeline exists for tenant
  ├── 2. DealsRepo.save(tenantId, newDeal) → DB INSERT
  ├── 3. AuditService.log()
  ├── 4. EventEmitter.emit('crm.deal.created', payload)
  │
  ▼
Returns 201 Created { success: true, data: deal }
  │
Client updates UI cache (SWR / React Query)
```

---

## 3. Background Job Flow (Asynchronous)

Example: **Workflow Execution via Event**

```
EventEmitter.emit('crm.deal.created')
  │ (in-memory)
  ▼
WorkflowTriggerListener
  │
  ├── 1. Queries active workflows for 'DEAL_CREATED'
  ├── 2. workflowQueue.add('execute', { workflowId, triggerId })
  │
  ▼
BullMQ (Redis) stores job
  │
  ▼
Worker Process (Separate Pod)
  │
  ├── 1. pulls job from workflowQueue
  ├── 2. loads workflow schema
  ├── 3. executes Step 1 (e.g. SEND_EMAIL)
  ├── 4. emailQueue.add(...)
  ├── 5. updates workflow_executions table status
  │
  ▼
Job Completes
```

---

## 4. Ingestion Flow (Webhooks / External APIs)

Example: **Inbound WhatsApp Message**

```
Meta Cloud API
  │ POST /v1/whatsapp/webhook
  ▼
WhatsAppController
  │
  ├── 1. Verify HMAC Signature
  ├── 2. Acknowledge Meta (200 OK) immediately (to prevent retries)
  ├── 3. Push to Queue: whatsappQueue.add('process_inbound', payload)
  │
  ▼
WhatsAppWorker
  │
  ├── 1. find contact by phone number
  ├── 2. save message to DB
  ├── 3. (If Agent Active) → aiQueue.add('generate_reply')
  │
  ▼
AI Worker
  │
  ├── queries RAG + LLM
  ├── calls Meta API to send response
  └── saves response to DB
```

---

## 5. ETL Flow (Analytics Materialization)

Example: **Nightly Analytics Flush**

```
Scheduler (BullMQ Repeatable)
  │
  ▼
analyticsQueue.add('materialize_daily_rev')
  │
  ▼
AnalyticsWorker
  │
  ├── queries Main DB Read Replica for yesterday's won deals
  ├── aggregates total value, counts, by owner
  ├── Upserts into `analytics_daily_revenue` material table
  │
  ▼
Next day, UI Dashboards query the material table (sub-10ms response) instead of raw Deals table.
```
