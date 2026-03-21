# Prompt Engineering & AI Memory System
Project: autopilot.monster.crm

---

## 1. System Prompt Strategy
All AI interactions wrap user input inside deeply contextualized System Prompts based on the assigned Agent.

### 1.1 Base Persona Injector
```text
You are an intelligent assistant for {{tenant.name}}.
Your specific role is: {{agent.purpose}}.
Today's date is {{current_date}}.
Never invent facts. If the answer is not in your knowledge base, respond according to the fallback behavior: {{agent.fallbackBehavior}}.
```

### 1.2 Tool / Function Calling Prompting
When tools are enabled, the prompt dynamically includes the CRM tool definitions.
```text
You have access to the following CRM tools. You may invoke them to assist the user.
- get_contact(email: string)
- create_task(title: string, priority: string)
Do not reveal the technical names of these tools to the user.
```

---

## 2. Context Window Management
LLM models have strict token limits (e.g., GPT-4o holds 128k tokens).
To prevent token waste and reduce latency/cost:

### 2.1 The "Token Budget" approach (per request)
- **System Prompt:** 10%
- **RAG Retrieved Context:** 40%
- **Conversation History (Memory Window):** 30%
- **Reserved for Generation (Output):** 20%

### 2.2 Memory Truncation
1. The `ai_conversations` table holds unlimited message history.
2. Before making an OpenAI API call, the `AIService` pulls only the last `agent.memoryWindow` (e.g. 10) messages.
3. If those 10 messages exceed the 30% budget, older messages are iteratively dropped until the prompt fits the token limit.

---

## 3. RAG Formatting
When Qdrant returns vector search results, they are formatted tightly to save tokens:

```text
--- KNOWLEDGE CONTEXT ---
Source: Onboarding-Guide.pdf
Excerpt: "To add a new user, navigate to Settings > Members and click Invite."

Source: Pricing-FAQ.docx
Excerpt: "The Enterprise plan includes unlimited API access."
-------------------------
Answer the user using only the context above.
```
