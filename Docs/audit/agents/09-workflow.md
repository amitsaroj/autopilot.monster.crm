# Agent 9 — Workflow / Queue Specialist

**Date:** 2026-07-22  
**Scope:** BL-C08 (queue processors + workflow name mismatch), BL-H08 (Bull vs BullMQ), execution path, retry logic  
**Commit/push:** none

---

## Files changed

| File | Change |
|------|--------|
| `backend/src/queue/queue.constants.ts` | Added `JOB_NAMES` registry for shared job name constants |
| `backend/src/queue/processors/*.processor.ts` | New processors: email, sms, voice, notification, ai-inference, billing, analytics, search-index |
| `backend/src/queue/processors/queue-processors.module.ts` | Registers all platform queue processors; imported in `app.module.ts` |
| `backend/src/modules/workflow/workflow.module.ts` | Removed duplicate BullMQ `forRootAsync`; uses `@nestjs/bull` + `QUEUE_NAMES.WORKFLOW`; imports Crm/Notification/Voice |
| `backend/src/modules/workflow/workflow.processor.ts` | Migrated BullMQ `WorkerHost` → Bull `@Process(JOB_NAMES.EXECUTE_WORKFLOW)` on `workflow` queue |
| `backend/src/modules/workflow/workflow.service.ts` | `@InjectQueue(QUEUE_NAMES.WORKFLOW)` + `JOB_NAMES.EXECUTE_WORKFLOW` |
| `backend/src/modules/workflow/workflow.processor.spec.ts` | New — completion, delayed resume, failure/retry path |
| `backend/src/modules/voice/twilio.service.ts` | Added `sendSms()` for SMS queue processor |
| `backend/src/modules/admin/workers/admin-workers.*` | Worker status now includes workflow, voice, notification queues |
| `backend/src/app.module.ts` | Imports `QueueProcessorsModule` |
| `project-audit/CHECKPOINT.md` | Agent 9 wave notes |
| `project-audit/agents/09-workflow.md` | This report |

---

## BL-C08 — Root cause & fix

### Before (broken)

| Issue | Evidence |
|-------|----------|
| Workflow on BullMQ `'workflows'` (plural) | `workflow.module.ts` registered `name: 'workflows'` |
| Admin monitors Bull `'workflow'` (singular) | `QUEUE_NAMES.WORKFLOW = 'workflow'` in `admin-queues.service.ts` |
| Duplicate Bull root config | WorkflowModule had its own `BullModule.forRootAsync` (BullMQ) separate from global `QueueModule` (Bull) |
| 8 queues with no processors | email, sms, voice, notification, ai-inference, billing, analytics, search-index |

### After (fixed)

| Queue | Processor | Job name(s) | Status |
|-------|-----------|-------------|--------|
| `workflow` | `WorkflowProcessor` | `execute-workflow` | **Active** — unified Bull queue name |
| `email` | `EmailQueueProcessor` | `send-email` | **Active** — uses `EmailService` |
| `sms` | `SmsQueueProcessor` | `send-sms` | **Active** — uses `TwilioService.sendSms` |
| `voice` | `VoiceQueueProcessor` | `process-voice` | **Active** — uses `VoiceCallService` |
| `notification` | `NotificationQueueProcessor` | `send-notification` | **Active** — uses `NotificationService` |
| `ai-inference` | `AiInferenceQueueProcessor` | `run-inference` | **Registered** — returns DEFERRED (AI pipeline not wired) |
| `billing` | `BillingQueueProcessor` | `process-billing` | **Registered** — ACK stub (Stripe sync path exists) |
| `analytics` | `AnalyticsQueueProcessor` | `track-event` | **Registered** — log-only until analytics sink wired |
| `search-index` | `SearchIndexQueueProcessor` | `index-document` | **Registered** — DEFERRED (Qdrant queue fan-out open) |
| `whatsapp` | `WhatsappBroadcastProcessor` | `broadcast-message` | Already existed |
| `import` / `export` | `ImportJobProcessor` / `ExportJobProcessor` | `process-import`, etc. | Already existed |

All processors register **in-process** on NestJS app startup (same pattern as WhatsApp/import/export).

---

## Workflow execution path (verified)

```
CRM event (EventEmitter)
  → WorkflowEventListener (@OnEvent)
  → WorkflowService.triggerWorkflow()
  → Bull queue `workflow` job `execute-workflow`
  → WorkflowProcessor.handleExecuteWorkflow()
  → WorkflowExecutorService.extractSteps() + executeStep()
  → WorkflowActionExecutorService.executeAction() (CRM/email/WA/voice/webhook)
  → WorkflowExecution entity updated (RUNNING → COMPLETED | FAILED | PAUSED)
```

**Triggers:** `CONTACT_CREATED`, `CONTACT_UPDATED`, `DEAL_*`, `CALL_COMPLETED` via `workflow-event.listener.ts`  
**Conditions:** `CONDITION` / `CONDITION_BRANCH` with operators (equals, gt, in, contains, …)  
**Actions:** 15+ action types in `workflow-action-executor.service.ts`  
**Delay/resume:** Steps returning `SCHEDULED` re-enqueue with `delay`; execution set to `PAUSED`  
**Retry:** `POST /workflows/executions/:execId/retry` resets FAILED execution and re-enqueues  
**Manual:** `POST /workflows/:id/trigger` or `/execute`

---

## Test evidence

```bash
cd backend
npx jest --testPathPatterns=workflow --runInBand --forceExit
# Test Suites: 3 passed | Tests: 12 passed
#   workflow-executor.service.spec.ts — graph extraction, conditions, LOG/CREATE_TASK
#   workflow-action-executor.service.spec.ts — task, notify, delay, voice
#   workflow.processor.spec.ts — complete, scheduled resume, failure logging
```

**Build note:** `npm run build` fails on pre-existing unused-import errors in unrelated files (`voice.controller.ts`); workflow/queue changes typecheck clean in isolation.

**Runtime enqueue:** Redis not available in agent sandbox; processors register via NestJS `@Processor` on startup when API boots with Redis.

---

## Remaining gaps

| ID | Gap | Owner |
|----|-----|-------|
| BL-H08 partial | `@nestjs/bullmq` still in `package.json`; no runtime usage after this wave | Workflow |
| AI inference | `AiInferenceQueueProcessor` acknowledges only; wire to OpenAI/RAG | AI |
| Search index | `SearchIndexQueueProcessor` DEFERRED; wire Qdrant upsert/delete | Platform Search |
| Billing queue | No producers enqueue billing jobs yet; Stripe webhooks sync | Billing |
| Analytics queue | No producers; advanced analytics stubs | Analytics |
| `@nestjs/bullmq` dep | Can remove from package.json once confirmed unused | Infra hygiene |
| Integration test | No HTTP integration test for trigger → execution completion with Redis | Backend QA |
| LEAD_CREATED listener | Trigger type listed but no `@OnEvent` handler in listener | CRM/Workflow |

---

## Backlog impact

| ID | Status after this wave |
|----|------------------------|
| BL-C08 | 🟡 Partial → major fix (processors registered; workflow name unified; AI/search/billing producers still open) |
| BL-H08 | 🟡 Partial (BullMQ removed from workflow; package dep remains) |
| BL-H13 | 🟡 Partial (search-index processor exists; Qdrant wiring open) |

---

## Verify locally (with Redis)

```bash
docker compose up -d redis postgres
cd backend && npm run dev
# Manual trigger (needs auth token + tenant):
# POST /api/v1/workflows/:id/trigger  { "contactId": "..." }
# GET  /api/v1/workflows/executions
# Admin worker status: GET /api/v1/admin/workers (workflow queue should show ACTIVE)
```
