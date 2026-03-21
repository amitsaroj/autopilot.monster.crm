# AI Engine Design
Project: autopilot.monster.crm

---

## 1. Overview

The AI engine powers autonomous agents, knowledge-based Q&A (RAG), prompt management, AI-assisted CRM enrichment, and streaming conversations. It integrates with OpenAI GPT-4o, supports custom agent configuration, multi-channel deployment, and full usage tracking.

---

## 2. AI Agent Configuration

Each tenant can create multiple AI agents, each with:

| Field | Type | Description |
|---|---|---|
| `name` | string | Agent display name |
| `purpose` | string | What this agent does |
| `model` | string | `gpt-4o`, `gpt-4o-mini`, `claude-3-5-sonnet` |
| `temperature` | 0.0–1.0 | Response creativity |
| `maxTokens` | integer | Max response length |
| `systemPrompt` | text | Core instructions + persona |
| `knowledgeBaseIds` | UUID[] | RAG sources |
| `channels` | string[] | `chat`, `whatsapp`, `email`, `voice` |
| `tools` | JSON | Which CRM actions the agent can take |
| `memoryEnabled` | boolean | Include message history |
| `memoryWindow` | integer | Number of messages to include |
| `fallbackBehavior` | enum | `HUMAN_HANDOFF`, `APOLOGIZE`, `RETRY` |

---

## 3. RAG Pipeline

```
User Message
    │
    ▼
Embed user message (OpenAI text-embedding-3-small → 1536-dim vector)
    │
    ▼
Qdrant vector search in collection `tenant_{tenantId}`
  filter: { knowledge_base_id: { in: agent.knowledgeBaseIds } }
  limit: 5, score_threshold: 0.72
    │
    ▼
Retrieved chunks (top K relevant passages)
    │
    ▼
Build augmented prompt:
  [System Prompt]
  [Memory: last N messages]
  [Context: retrieved chunks]
  [User: current message]
    │
    ▼
LLM API call (streaming or non-streaming)
    │
    ▼
Response → save to ai_conversations → return to client
```

### 3.1 Document Indexing Flow

```
Upload document (PDF, URL, text)
    │
    ▼
Extract text (pdf-parse / cheerio web scrape)
    │
    ▼
Chunk text (500 tokens, 50-token overlap)
    │
    ▼
Embed each chunk (batch OpenAI embedding API)
    │
    ▼
Upsert to Qdrant:
  collection: tenant_{tenantId}
  payload: { knowledge_base_id, source_type, source_id, chunk_index, text, url? }
    │
    ▼
Update knowledge_base record (doc_count, token_count, last_synced_at)
```

---

## 4. Streaming Conversation (SSE)

```
POST /ai/chat
    │
    ▼
Server-Sent Events (SSE) response:

data: {"type":"message","delta":"Hello"}
data: {"type":"message","delta":" Sarah"}
data: {"type":"message","delta":"!"}
data: {"type":"done","usage":{"input_tokens":142,"output_tokens":48}}
data: [DONE]
```

Client subscribes using `EventSource` API or `fetch` with `ReadableStream`.

---

## 5. AI Tools (Function Calling)

Agents can invoke CRM actions via OpenAI function calling:

| Tool | Description |
|---|---|
| `get_contact` | Look up contact by email/name |
| `create_contact` | Create new CRM contact |
| `create_deal` | Open new deal |
| `update_deal_stage` | Move deal to a stage |
| `create_task` | Assign a follow-up task |
| `log_activity` | Log a call/meeting/note |
| `get_deal_status` | Get current deal info |
| `schedule_meeting` | Create calendar link |
| `send_email` | Send templated email |

---

## 6. Memory Management

When `memoryEnabled: true`, the system stores and retrieves the last N messages:

```typescript
interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
}

// Stored as JSONB in ai_conversations.messages
// Trimmed to last `memoryWindow` exchanges before each LLM call
// Token budget: Leave 40% of maxTokens for context, 60% for generation
```

---

## 7. Usage Tracking

Every LLM call records:
- `input_tokens`: Tokens in the prompt
- `output_tokens`: Tokens in the response
- `model`: Model used
- `cost`: Estimated cost in USD (from pricing table)
- `agent_id`: Which agent
- `tenant_id`: For billing

Monthly token usage is aggregated into `usage_records` for billing enforcement.

---

## 8. Knowledge Base Source Types

| Type | Ingestion Method |
|---|---|
| `PDF` | pdf-parse → text extraction → chunking |
| `URL_CRAWL` | Cheerio scrape → paragraph extraction |
| `PLAIN_TEXT` | Direct chunking |
| `DOCX` | mammoth library |
| `NOTION` | Notion API export |
| `GOOGLE_DOC` | Google Docs API |

---

## 9. AI Limits by Plan

| Plan | AI Messages/Month | Agents | KB Sources | Models Available |
|---|---|---|---|---|
| Starter | 1,000 | 1 | 2 | gpt-4o-mini |
| Professional | 10,000 | 5 | 10 | gpt-4o-mini, gpt-4o |
| Enterprise | Unlimited | Unlimited | Unlimited | All models |

---

## 10. Human Handoff Protocol

When `fallbackBehavior: HUMAN_HANDOFF`:

1. Agent detects it cannot answer (confidence < 0.5, explicit request, escalation keyword)
2. AI marks conversation `status: HANDED_OFF`
3. Emit `ai.handoff.requested` event
4. Notify assigned human agent (email + in-app notification)
5. Human agent takes over from where AI left off
6. Conversation resumes with full context

---

## 11. Prompt Templates

Tenants can save, version, and reuse prompt templates:

```json
{
  "id": "tmpl-uuid",
  "name": "CRM Lead Qualifier",
  "content": "You are a BDR at {{tenant.name}}. Your job is to qualify inbound leads...",
  "variables": ["tenant.name", "product.name"],
  "category": "sales"
}
```
