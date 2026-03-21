# Limits Architecture
Project: autopilot.monster.crm

---

## 1. The Strategy of Limits

AutopilotMonster uses limits not just to protect database performance, but as the primary lever for upselling SaaS plans.

### 1.1 Types of Limits
- **Soft Limits (Metered):** Overage is allowed but billed per unit at the end of the month (e.g., AI requests, Twilio minutes).
- **Hard Limits (Gated):** Overage is physically blocked by the API. The user must upgrade their plan to proceed (e.g., number of active users, number of active workflow automations).
- **Rate Limits (Velocity):** X actions per Y seconds to prevent abuse (e.g., 5 bulk imports per hour).

---

## 2. Hard Limits Registry

| Limit Key | Starter Plan | Pro Plan | Enterprise Plan |
|---|---|---|---|
| `max_users` | 5 | 25 | Unlimited |
| `max_contacts` | 2,500 | 25,000 | Unlimited |
| `max_pipelines` | 1 | 5 | Unlimited |
| `max_custom_fields` | 0 | 20 | 100 |
| `max_workflows` | 5 | 50 | Unlimited |
| `max_ai_agents` | 1 | 5 | Unlimited |
| `max_kb_sources` | 2 | 10 | Unlimited |

---

## 3. Storage Limits

Unlike database rows, file storage (avatars, attachments, imports) is calculated daily via a background job.
1. `BucketAnalyzerWorker` iterates through MinIO paths `tenant-{id}/*`.
2. Calculates total bytes.
3. If bytes > Plan Allowance, the API begins rejecting new `POST /files/upload` with `402 Payment Required` (unless storage add-on credits are purchased).
