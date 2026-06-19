# Workflow Engine Audit

**Date:** 2026-06-19  
**Scope:** Builder, Triggers, Conditions, Actions, Delays, Webhooks, CRM/Voice/WhatsApp/Email Actions, Execution Logs, Retry Logic  
**Agent:** AGENT 11 — WORKFLOW ENGINE AUDITOR

---

## Executive Summary

The workflow engine has a **functional BullMQ execution core** with CRM, email, WhatsApp, webhook, and delay actions. Key gaps were **missing voice call action**, **incomplete trigger/action catalogs**, **mock admin UI data**, **no execution retry API**, and **partial event wiring**.

**Issues fixed in this audit:** 14  
**Remaining medium/low gaps:** documented below

---

## Architecture Overview

| Layer | Location | Notes |
|-------|----------|-------|
| Workflow API | `backend/src/modules/workflow/` | CRUD, trigger, executions, metadata |
| Executor | `workflow-executor.service.ts` | Step extraction, conditions, delegation |
| Action executor | `workflow-action-executor.service.ts` | CRM, email, WhatsApp, voice, webhooks, delays |
| Queue processor | `workflow.processor.ts` | BullMQ worker, delay resume, status updates |
| Event listener | `workflow-event.listener.ts` | Domain event → workflow trigger |
| Tenant UI | `frontend/src/app/(app)/workflows/` | List, edit (JSON), runs |
| Admin UI | `frontend/src/app/admin/workflows/` | Dashboard, triggers, executions |
| DB | `flows`, `workflow_executions` | Definition JSONB, step output logging |

Execution model: **trigger → queue job → linear step walk → optional delay reschedule → COMPLETED/FAILED/PAUSED**.

---

## Component Audit

### 1. Builder — Partial

| Item | Status | Details |
|------|--------|---------|
| Visual builder page | MOCK | `/workflows/builder` is static UI only |
| JSON definition editor | OK | `/workflows/[id]/edit` loads/saves via API |
| Node graph extraction | OK | Linear traversal from trigger node via edges |
| Branching (if/else paths) | MISSING | Graph supports branches in UI mock; executor walks single path only |
| Templates page | MOCK | Static template gallery |

### 2. Triggers — Fixed

| Item | Status | Details |
|------|--------|---------|
| CONTACT_CREATED | OK | Emitted + listener wired |
| CONTACT_UPDATED | FIXED | Now emitted on update/assignOwner/addTag + listener added |
| DEAL_CREATED / STAGE_CHANGED / WON / LOST | OK | deal.service emits; listener handles |
| CALL_COMPLETED | FIXED | Twilio webhook emits CALL_ENDED → listener maps to CALL_COMPLETED trigger |
| LEAD_CREATED | WARN | Listed in metadata; no domain event emitter yet |
| WHATSAPP_MESSAGE_RECEIVED | WARN | Listed; no listener wired |
| WEBHOOK / SCHEDULE | WARN | Metadata only; inbound webhook trigger endpoint not implemented |
| Admin triggers page | FIXED | Was mixing actions into trigger list; now shows triggers only with categories |

### 3. Conditions — Fixed

| Item | Status | Details |
|------|--------|---------|
| equals / not_equals | OK | |
| contains | OK | |
| not_contains | FIXED | Added |
| starts_with / ends_with | FIXED | Added |
| greater_than / less_than | OK | |
| is_empty / is_not_empty | OK | |
| in / not_in | FIXED | Added |
| Compound AND/OR groups | MISSING | Design doc describes nested conditions; not implemented |
| Branch routing (ifTrue/ifFalse) | MISSING | Condition halts chain on fail; no alternate path |

### 4. Actions — Fixed

| Action | Status | Details |
|--------|--------|---------|
| CREATE/UPDATE_CONTACT | OK | Template variable resolution |
| CREATE/UPDATE_DEAL | OK | Default pipeline fallback |
| MOVE_PIPELINE_STAGE | OK | |
| ASSIGN_OWNER | OK | contact or deal |
| ADD_TAG | OK | |
| CREATE_TASK / CREATE_NOTE | OK | |
| SEND_EMAIL | OK | EmailService + CRM email log |
| SEND_WHATSAPP | OK | Template resolution on message |
| INITIATE_CALL | FIXED | Wired to VoiceCallService |
| NOTIFY_TEAM | OK | In-app notification |
| CALL_WEBHOOK | FIXED | Template resolution on config; default payload includes event context |
| DELAY / WAIT_DELAY | OK | Inline ≤30s; longer delays reschedule via BullMQ |
| AI_CHAT / AI_RESPONSE | SKIPPED | Returns SKIPPED with reason |
| LOG | OK | |
| SMS / ADD_TO_CAMPAIGN / REMOVE_TAG | MISSING | In design doc, not implemented |

### 5. Delays — Fixed

| Item | Status | Details |
|------|--------|---------|
| Short inline delay | OK | ≤30s blocks worker |
| Long delay reschedule | OK | PAUSED status + delayed BullMQ job |
| Resume from PAUSED | FIXED | Processor sets RUNNING on resume |
| Delayed job retry | FIXED | Resume jobs now use 3 attempts + exponential backoff |

### 6. Webhooks — Partial

| Item | Status | Details |
|------|--------|---------|
| Outbound CALL_WEBHOOK action | FIXED | Template vars + error on HTTP ≥400 |
| Inbound WEBHOOK trigger | MISSING | No public endpoint to trigger workflows by secret |
| Signature validation | MISSING | N/A until inbound trigger exists |

### 7. Execution Logs — Fixed

| Item | Status | Details |
|------|--------|---------|
| workflow_executions entity | OK | status, input, output.steps, error |
| List executions API | OK | GET /workflows/executions |
| Execution detail API | OK | GET /workflows/executions/:id |
| Tenant runs UI | OK | `/workflows/[id]/runs` + detail page |
| Admin executions page | FIXED | Live API data, PAUSED filter |
| Admin dashboard | FIXED | Was hardcoded stats; now uses API |

### 8. Retry Logic — Fixed

| Item | Status | Details |
|------|--------|---------|
| BullMQ job retries | OK | 3 attempts, exponential backoff on trigger |
| Failed execution retry API | FIXED | POST /workflows/executions/:id/retry |
| Admin retry button | FIXED | Failed runs can be retried from admin UI |
| Per-step retryCount config | MISSING | Design doc field not honored in processor |

---

## Tests

| Test | Status |
|------|--------|
| `workflow-executor.service.spec.ts` | OK — graph extraction, conditions, LOG/CUSTOM delegation |
| `workflow-action-executor.service.spec.ts` | OK — task, notify, delay, voice call |
| `workflow-crud-http.integration.spec.ts` | EXTENDED — triggers, actions, executions list |

Unit tests: **8 passing** (after audit changes).

---

## Fixes Applied

1. Added `INITIATE_CALL` / `MAKE_CALL` voice action with `VoiceModule` import
2. Expanded trigger and action metadata catalogs with categories
3. Added condition operators: `not_contains`, `starts_with`, `ends_with`, `in`, `not_in`
4. Fixed `CALL_WEBHOOK` template resolution and default payload
5. Resume PAUSED executions as RUNNING after delay
6. Added retry attempts to delayed resume jobs
7. Added `retryExecution` service + `POST /workflows/executions/:execId/retry`
8. Emit `CONTACT_UPDATED` from contact service mutations
9. Added `CONTACT_UPDATED` and `CALL_COMPLETED` event listeners
10. Emit `CALL_ENDED` from Twilio status webhook
11. Wired admin workflows dashboard to live API
12. Fixed admin triggers page (removed action pollution)
13. Added PAUSED status + retry UI on admin executions page
14. Standardized `WorkflowMetaController` API envelope

---

## Remaining Gaps (Priority Order)

1. **Visual builder** — Replace static builder with node editor wired to workflow API
2. **Branching** — Support CONDITION_BRANCH true/false paths in graph traversal
3. **Inbound webhook trigger** — Public endpoint with secret validation
4. **Scheduled triggers** — Cron integration via scheduler module
5. **LEAD_CREATED / WHATSAPP_MESSAGE_RECEIVED** — Wire domain event emitters
6. **AI actions** — Connect to AI agent service
7. **Per-step retry config** — Honor `retryCount` / `onFailureStepId` from definition
8. **SMS action** — Not implemented

---

## Files Modified

### Backend
- `backend/src/modules/workflow/workflow-action-executor.service.ts`
- `backend/src/modules/workflow/workflow-executor.service.ts`
- `backend/src/modules/workflow/workflow.service.ts`
- `backend/src/modules/workflow/workflow.controller.ts`
- `backend/src/modules/workflow/workflow.processor.ts`
- `backend/src/modules/workflow/workflow.module.ts`
- `backend/src/modules/workflow/workflow-event.listener.ts`
- `backend/src/modules/workflow/workflow-meta.controller.ts`
- `backend/src/modules/crm/contact.service.ts`
- `backend/src/modules/voice/twilio.controller.ts`
- `backend/src/modules/workflow/*.spec.ts`
- `backend/test/integration/workflow-crud-http.integration.spec.ts`

### Frontend
- `frontend/src/app/admin/workflows/page.tsx`
- `frontend/src/app/admin/workflows/triggers/page.tsx`
- `frontend/src/app/admin/workflows/executions/page.tsx`
- `frontend/src/services/workflow.service.ts`

---

## Verdict

**Workflow engine: Production-capable for linear automations** (CRM + email + WhatsApp + voice + webhooks + delays). Not yet production-ready for complex branching, inbound webhooks, or visual builder workflows. Retry and execution logging are now operational end-to-end.
