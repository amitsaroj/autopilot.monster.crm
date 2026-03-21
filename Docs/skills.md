# Agent Skills Mapping
Project: autopilot.monster.crm

---

## 1. What are "Skills"?
The AI Engine uses a modular framework of "Skills" (similar to OpenAI function specs) to allow LLMs to take real action.

## 2. Default Available Skills

| Skill Name | Function Signature | Purpose |
|---|---|---|
| `crm_search` | `(query: string, entityType: string) => JSON` | Locates specific CRM records using vector similarity via Qdrant or literal TS_Query. |
| `calendar_check`| `(agentId: string, durationMin: int) => TimeSlot[]` | Views the synchronized Google/Outlook calendar of the assigned Sales Rep. |
| `schedule_call` | `(contactId: string, time: ISOString) => boolean` | Books a calendar invite and sends conf emails via Workflow trigger. |
| `update_deal` | `(dealId: string, payload: {stage, value, note}) => void` | Mutates a specific pipeline deal. |

## 3. Defining Custom Skills
Enterprise tenants can build a custom Skill using Webhooks:
- They define the JSON Schema required for the skill.
- The AI Agent determines when the skill is needed.
- Instead of executing internal code, the AI Engine POSTs the payload to the customer's secure webhook endpoint.
- It pauses generation, waits for the customer's server to reply with a JSON response, and continues formulating text based on that external response.
