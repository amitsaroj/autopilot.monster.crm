# AI Platform Audit — Agent 8

**Date:** 2026-06-19  
**Scope:** AI Agents, Knowledge Base, Prompt Library, Embeddings, Vector Search, RAG, Memory, Usage, Fine-Tuning, Model Configuration, Cost Tracking  
**Paths:** `backend/src/modules/ai/`, `frontend/src/app/(app)/ai/`, `frontend/src/app/admin/ai/`, Qdrant config, integration tests

---

## Executive Summary

| Area | Status Before | Status After |
|------|---------------|--------------|
| AI Agents | ✅ Backend CRUD via CRM AgentService | ✅ Unchanged — working |
| Knowledge Base | ⚠️ Static UI, partial indexing | ✅ Wired to API + KB metadata |
| Prompt Library | ✅ Backend + frontend list | ✅ Added missing plan/permission guards |
| Embeddings | ⚠️ Hardcoded model | ✅ Tenant-configurable via orchestrator |
| Vector Search (Qdrant) | ⚠️ No KB filter, no API key | ✅ KB-scoped filter + config apiKey |
| RAG Pipeline | ⚠️ Basic, no cost tracking | ✅ Context + memory + usage tracking |
| Memory | ❌ Not implemented in chat | ✅ Last N messages in chat prompt |
| AI Usage | ❌ Hardcoded stub (15000 tokens) | ✅ Real billing `usage_records` |
| Fine-Tuning | ✅ OpenAI integration | ✅ Unchanged — working |
| Model Configuration | ⚠️ Admin UI mock-only | ✅ Wired to admin settings API |
| Cost Tracking | ❌ Stub | ✅ Per-call token + cost via BillingService |
| Tests | ❌ None | ✅ `ai-platform-http.integration.spec.ts` |

---

## Backend Architecture

### Module: `backend/src/modules/ai/`

| Controller | Route Prefix | Purpose |
|------------|--------------|---------|
| `AiController` | `/ai` | Generate, chat, stream, analyze, models, usage, legacy KB/chats |
| `AiAgentsController` | `/ai/agents` | Agent CRUD, activate/pause |
| `AiPromptsController` | `/ai/prompts` | Prompt library CRUD |
| `KnowledgeBasesController` | `/ai/knowledge-bases` | KB CRUD, sync, document upload/delete |
| `ConversationsController` | `/ai/conversations` | Paginated conversations, messages, handoff |
| `FineTuningController` | `/ai/fine-tuning` | Fine-tuning job lifecycle |

### Services

| Service | Responsibility |
|---------|----------------|
| `RagService` | OpenAI client, Qdrant indexing/search, usage recording |
| `KnowledgeBaseService` | PostgreSQL KB records + indexMeta |
| `ConversationService` | Message persistence, memory source |
| `AiPromptService` | Prompt templates |
| `FineTuningService` | OpenAI fine-tuning jobs |
| `AgentService` (CRM) | AI agent entity management |

### Qdrant Integration

- **Config:** `backend/src/config/qdrant.config.ts` — `QDRANT_URL`, `QDRANT_API_KEY`, collection names
- **Collection naming:** `kb_{tenantId}` (sanitized)
- **Vector size:** 1536 (text-embedding-3-small)
- **Payload fields:** `tenantId`, `knowledgeBaseId`, `documentId`, `fileName`, `text`, `chunkIndex`, `timestamp`
- **Search:** Cosine similarity with optional `knowledgeBaseId` filter

### RAG Pipeline (Post-Fix)

```
User message
  → Optional: embed query → Qdrant search (KB-filtered)
  → Optional: load last N conversation messages (memory)
  → Build augmented prompt [Context | Memory | User]
  → OpenAI chat completion (streaming or sync)
  → Persist messages + track ai_tokens / ai_cost in usage_records
```

---

## Issues Found & Fixed

### Critical

| # | Issue | Fix |
|---|-------|-----|
| 1 | `RagService` depended on `ConfigOrchestratorService` but `AiModule` did not import `TenantSettingsModule` | Added `TenantSettingsModule` import |
| 2 | `getUsage()` returned hardcoded `{ tokensUsed: 15000, cost: 0.45 }` | Wired to `BillingService.getUsage()` + real `trackUsage()` on every LLM/embedding call |
| 3 | Qdrant client ignored `QDRANT_API_KEY` | Pass apiKey from qdrant config |
| 4 | Document indexing did not associate vectors with `knowledgeBaseId` | Added KB ID to payload + filter in search |
| 5 | KB upload did not update PostgreSQL `indexMeta` or status | Controller updates documents array + READY/FAILED status |

### High

| # | Issue | Fix |
|---|-------|-----|
| 6 | Chat had no conversation memory | Added `memoryWindow` (default 6) loading prior messages |
| 7 | `AiPromptsController` missing `@ResourcePermissions('ai')` and `@PlanFeature('ai')` | Added decorators |
| 8 | Frontend conversations page expected array; API returns paginated `{ items, total }` | Fixed `ai-chat.service.ts` parsing |
| 9 | Knowledge base page was 100% mock/static data | Wired to `knowledge-base.service.ts` |
| 10 | Admin AI settings page was fake save (setTimeout) | Wired to `adminAiSettingsService` |

### Medium

| # | Issue | Fix |
|---|-------|-----|
| 11 | No frontend `knowledge-base.service.ts` | Created service |
| 12 | Duplicate legacy routes `/ai/kb` and `/ai/knowledge-bases` | Kept both; canonical is `/ai/knowledge-bases` |
| 13 | No AI integration tests | Added `ai-platform-http.integration.spec.ts` |
| 14 | Embedding model hardcoded | Reads `ai_embedding_model` from tenant config |
| 15 | Default chat model hardcoded | Reads `ai_default_model` from tenant config |

### Remaining Gaps (Not Fixed — Out of Scope)

| Gap | Priority | Notes |
|-----|----------|-------|
| Agent entity lacks `knowledgeBaseIds`, `memoryEnabled`, `tools`, `channels` per ai_engine.md | P1 | Schema extension needed |
| OpenAI function calling / CRM tools | P1 | Designed in Docs/ai_engine.md, not implemented |
| URL crawl, Notion, Google Doc ingestion | P2 | Only PDF/DOCX/TXT supported |
| Human handoff event emission | P2 | `handoff()` sets status only |
| Score threshold (0.72) on vector search | P3 | No threshold filter yet |
| Anthropic/Claude model support | P2 | OpenAI only |
| Fine-tuning page lacks dataset upload UI | P2 | Requires storage file key |
| `POST /ai/chat` with live OpenAI in CI | P3 | Test skips when no API key |

---

## Frontend Pages

### Tenant App (`frontend/src/app/(app)/ai/`)

| Page | Route | API Wired | Notes |
|------|-------|-----------|-------|
| Hub | `/ai` | Partial | Navigation hub |
| Agents | `/ai/agents` | ✅ | CRUD via ai-agent.service |
| Agent detail/edit/new | `/ai/agents/*` | ✅ | |
| Chat | `/ai/chat` | ✅ | SSE streaming |
| Conversations | `/ai/conversations` | ✅ Fixed | Paginated list |
| Prompts | `/ai/prompts` | ✅ | |
| Knowledge Base | `/ai/knowledge-base` | ✅ Fixed | Live data + upload |
| KB Upload | `/ai/knowledge-base/upload` | ✅ Fixed | Uses KB-scoped upload |
| Usage | `/ai/usage` | ✅ Fixed | Real metrics display |
| Fine-Tuning | `/ai/fine-tuning` | ✅ | Job list/create/delete |
| Settings | `/ai/settings` | ✅ | Tenant settings |

### Admin (`frontend/src/app/admin/ai/`)

| Page | Route | API Wired | Notes |
|------|-------|-----------|-------|
| Dashboard | `/admin/ai` | Partial | |
| Agents | `/admin/ai/agents` | ✅ | |
| Conversations | `/admin/ai/conversations` | ⚠️ | Needs admin API review |
| Prompts | `/admin/ai/prompts` | ⚠️ | Uses tenant prompts |
| Models | `/admin/ai/models` | ⚠️ | Static UI |
| Analytics | `/admin/ai/analytics` | ⚠️ | Static UI |
| Settings | `/admin/ai/settings` | ✅ Fixed | Platform AI config |

---

## Test Coverage

| Test File | Coverage |
|-----------|----------|
| `test/integration/ai-platform-http.integration.spec.ts` | Models, agents, prompts, KB CRUD, usage, conversations |
| Unit tests for RagService | ❌ Not added |
| E2E chat/RAG with Qdrant | ❌ Requires Qdrant + OpenAI in CI |

Run:
```bash
cd backend && npm test -- --testPathPattern=ai-platform-http
```

---

## Configuration

| Env Var | Purpose | Default |
|---------|---------|---------|
| `OPENAI_API_KEY` | Platform fallback LLM key | mock-api-key |
| `QDRANT_URL` | Vector DB endpoint | http://localhost:6333 |
| `QDRANT_API_KEY` | Qdrant auth | (empty) |
| `QDRANT_COLLECTION_AI` | Named collection config | ai-vectors |

Tenant-level overrides via `ConfigOrchestratorService`: `openai_key`, `ai_default_model`, `ai_embedding_model`

Platform admin settings (`/admin/settings/ai`): `openaiKey`, `anthropicKey`, `defaultModel`, `platformRole`, `embeddingModel`

---

## Cost Tracking Model

| Metric | Stored In | Unit |
|--------|-----------|------|
| `ai_tokens` | `usage_records.quantity` | Total input + output tokens |
| `ai_cost` | `usage_records.quantity` | Micro-dollars (cost × 10000) |

Pricing table in `RagService.MODEL_COST_PER_1K` for gpt-4o, gpt-4o-mini, text-embedding-3-small.

---

## Recommendations (Next Sprint)

1. Extend `Agent` entity with `knowledgeBaseIds`, `memoryEnabled`, `memoryWindow`, `model`, `temperature`
2. Implement OpenAI tool calling for CRM actions (get_contact, create_deal, etc.)
3. Add Qdrant health check to `/health` (health.controller.ts has TS errors unrelated to AI)
4. Add RagService unit tests with mocked OpenAI/Qdrant
5. Wire admin analytics page to usage aggregation endpoints
6. Add document delete that removes Qdrant vectors by `documentId`

---

## Files Modified in This Audit

**Backend**
- `src/modules/ai/ai.module.ts`
- `src/modules/ai/rag.service.ts`
- `src/modules/ai/ai.controller.ts`
- `src/modules/ai/ai-agents.controller.ts`
- `src/modules/ai/knowledge-bases.controller.ts`
- `src/modules/ai/fine-tuning.service.ts`
- `src/modules/ai/dto/ai.dto.ts`

**Frontend**
- `src/services/knowledge-base.service.ts` (new)
- `src/services/ai-chat.service.ts`
- `src/app/(app)/ai/conversations/page.tsx`
- `src/app/(app)/ai/usage/page.tsx`
- `src/app/(app)/ai/knowledge-base/page.tsx`
- `src/app/(app)/ai/knowledge-base/upload/page.tsx`
- `src/app/admin/ai/settings/page.tsx`

**Tests**
- `test/integration/ai-platform-http.integration.spec.ts` (new)

---

*Audit completed by Agent 8 — AI Platform Auditor*
