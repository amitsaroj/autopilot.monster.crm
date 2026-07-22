# Agent 06 — AI Platform Specialist

**Date:** 2026-07-22  
**Wave:** AI platform fixes (hub KPIs, prompt templates, queue producer, usage/billing alignment)  
**Status:** Partial complete — core wiring fixed; RAG stubs and fine-tuning remain open

---

## P0 — AI Hub mock KPIs (F-029)

### Problem
`(app)/ai/page.tsx` showed hardcoded usage (`1.2M` tokens, `842` conversations, etc.).

### Fix
- Converted hub to client component fetching `GET /api/v1/ai/usage`.
- Shows loading spinner, retry on error, and real zero-state values when no usage exists.
- Period label sourced from `periodStart` in usage payload.

---

## P1 — Prompt template controller unwired (F-028 / BL-M02)

### Problem
`PromptTemplateController` existed but was not registered in `AiModule`; `PromptTemplate` entity missing from `forFeature`.

### Fix
- Registered `PromptTemplateController` + `PromptTemplateService` in `AiModule`.
- Added `PromptTemplate` to TypeORM `forFeature`.
- Added DTO validation (`CreatePromptTemplateDto`, `UpdatePromptTemplateDto`, `RenderPromptTemplateDto`).
- Added `@ResourcePermissions('ai')` + `@PlanFeature('ai')` guards.

**Routes now live:** `POST/GET/PATCH/DELETE /api/v1/ai/templates`, `POST /api/v1/ai/templates/:id/render`

---

## P1 — AI inference queue producer (BL-C08 follow-up)

### Problem
`AiInferenceQueueProcessor` registered (Agent 9) but returned `{ status: 'DEFERRED' }`; no producer.

### Fix
- Added `AiInferenceQueueService` (Bull producer on `ai-inference` queue).
- Processor now calls `RagService.generate()` for real inference.
- Added `POST /api/v1/ai/generate/async` → returns `{ jobId, status: 'queued' }`.
- `QueueProcessorsModule` imports `forwardRef(() => AiModule)` for `RagService` DI.

---

## P1 — Usage / billing alignment

### Fix
- `GET /api/v1/ai/usage` now aggregates:
  - `tokensUsed`, `cost` (from `ai_tokens` / `ai_cost` billing metrics)
  - `conversations` (conversation count)
  - `embeddings` (sum of KB `indexMeta.totalChunks`)
  - `periodStart`
- `RagService.getUsage()` includes `periodStart` via `resolveUsagePeriodBounds`.
- `AnalyticsService.getAiUsageAnalytics()` cost now reads `ai_cost` quantity / 10000 (matches billing trackUsage scale).

---

## P1 — Validation + permissions on AI write endpoints

| Area | Status | Notes |
|------|--------|-------|
| `AiAgentsController` | ✅ | DTOs + `@ResourcePermissions('ai')` |
| `AiPromptsController` | ✅ | DTOs + permissions |
| `KnowledgeBasesController` | ✅ | DTOs + permissions |
| `ConversationsController` | ✅ | DTOs + permissions |
| `FineTuningController` | ✅ | DTOs + permissions |
| `PromptTemplateController` | ✅ Fixed | Was missing guards + DTOs |
| `AiController` legacy `POST /ai/kb` | ✅ Fixed | Uses `CreateLegacyKnowledgeBaseDto` |

---

## Endpoint / page status

| Route / Page | Status | Notes |
|--------------|--------|-------|
| `(app)/ai` hub | 🟡→Fixed KPIs | Real API data + empty/error states |
| `(app)/ai/usage` | ✅ | Already wired to `/ai/usage` |
| `GET /ai/usage` | ✅ Enhanced | conversations + embeddings |
| `GET /ai/models` | ✅ | Static model list |
| `POST /ai/generate` | ✅ | Sync OpenAI via RagService |
| `POST /ai/generate/async` | ✅ New | Queues Bull job |
| `POST /ai/chat`, `/chat/stream` | 🟡 Partial | Works; RAG depends on Qdrant + OpenAI key |
| `GET/POST /ai/templates` | ✅ Fixed | Wired + validated |
| `GET/POST /ai/knowledge-bases` | ✅ | CRUD + document upload/index |
| `GET/POST /ai/agents`, `/prompts` | ✅ | CRUD with DTOs |
| `GET/POST /ai/conversations` | ✅ | Paginated list |
| `GET/POST /ai/fine-tuning` | 🟡 Partial | CRUD; no real OpenAI fine-tune job |
| `RagService.crawlUrl` | 🔴 Stub | Returns fake pagesIndexed |
| `RagService.getKnowledgeAnalytics` | 🔴 Stub | Returns fake analytics |

---

## Tests run

| Suite | Result |
|-------|--------|
| `npm run build` (backend) | **PASS** |
| `npm run test:integration -- --testPathPatterns="ai-platform\|ai-agents-read"` | **11/11 PASS** |

New coverage in `ai-platform-http.integration.spec.ts`:
- Usage response includes `conversations`, `embeddings`
- Prompt template CRUD lifecycle
- Async generate queues job

---

## Remaining AI gaps

1. **RAG runtime** — Requires live OpenAI key + Qdrant; failures return empty context (graceful degrade).
2. **URL crawl** — `crawlUrl` stub; no web scraper wired.
3. **Knowledge analytics** — `getKnowledgeAnalytics` stub; admin analytics partially real via billing.
4. **Fine-tuning** — Job CRUD only; no OpenAI fine-tune API integration.
5. **Model config UI** — Tenant `ai_default_model` / `ai_embedding_model` via config orchestrator; no dedicated tenant settings page beyond admin.
6. **Workflow AI action** — No workflow executor step enqueues `ai-inference` queue yet.
7. **ai_messages metric** — Not incremented on chat; analytics falls back to assistant message count.
8. **F-029 reclassify** — Hub fixed; mark 🟡 Partial (not ✅ — no FE tests).

---

## Files changed

```
backend/src/modules/ai/ai.module.ts
backend/src/modules/ai/ai.controller.ts
backend/src/modules/ai/ai-inference-queue.service.ts
backend/src/modules/ai/prompt-template.controller.ts
backend/src/modules/ai/prompt-template.service.ts
backend/src/modules/ai/rag.service.ts
backend/src/modules/ai/dto/prompt-template.dto.ts
backend/src/modules/ai/dto/knowledge-base.dto.ts
backend/src/modules/analytics/analytics.service.ts
backend/src/queue/processors/ai-inference.processor.ts
backend/src/queue/processors/queue-processors.module.ts
backend/test/integration/ai-platform-http.integration.spec.ts
frontend/src/app/(app)/ai/page.tsx
project-audit/agents/06-ai-platform.md
project-audit/CHECKPOINT.md
```
