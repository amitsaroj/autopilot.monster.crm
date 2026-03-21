# Cost Rules & Controls
Project: autopilot.monster.crm

---

## 1. Cost Containment Strategy
Since AutopilotMonster connects to metered external APIs (OpenAI, Twilio, Meta), an abusive or compromised tenant account could generate massive unexpected vendor bills. Hard limits and circuit breakers are required.

---

## 2. Global Circuit Breakers

### 2.1 Max Spend Alerting
The `billing` module runs a background job checking total inferred COGS every 15 minutes.
If a tenant's estimated usage exceeds $500 in a single 24-hour period (and they are not an Enterprise contract), the system automatically:
1. Emits `billing.fraud_suspected` event.
2. Disables external integrations (`feature_flags`: voice=false, ai=false, whatsapp=false)
3. Alerts the Super Admin via Slack/PagerDuty.

### 2.2 Hard Caps per Resource
Regardless of usage-based billing, hard technical caps exist:
- **Max Twilio call duration:** 120 minutes (force disconnect to prevent abandoned open lines).
- **Max AI Context Window:** System strictly truncates messages to max 64k tokens even if the model supports 128k, preventing single-query token exhaustion.
- **Max WhatsApp Broadcast batch:** 10,000 messages per hour.

---

## 3. Plan-Level Soft Caps

Tenants can set a "Spend Limit" on their billing dashboard:
- Example: "Stop voice/AI/WhatsApp services if my monthly overage bill reaches $100."
- When `current_overage >= user_spend_limit`, the system emits `billing.limit.reached` and toggles feature access to `READ_ONLY`.

---

## 4. Retries & Escalating Costs
Workflow and event-bus retries inherently cost money if they hit external APIs.
Rule:
If an API step (e.g. LLM completion) fails due to a `4xx` client error, **do not retry** (prevents wasting tokens on bad requests).
Only retry on `5xx` or `429` errors with exponential backoff.
