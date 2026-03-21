# Module Control
Project: autopilot.monster.crm

---

## 1. Admin Module Control
Super Admins have a central "Module Switchboard" in their UI.

If a vendor API goes down (for instance, OpenAI reports a major outage), the Super Admin clicks "Disable" on the AI Engine module.

### 1.1 Action Taken
- A message is published to Redis Pub/Sub: `SYSTEM_MODULE_DISABLE: ai`.
- Every active API and Worker Node instantly updates local memory.
- All HTTP requests to `/v1/ai/*` return `503 Service Unavailable (Maintenance)`.
- UI detects the 503 and greys out the Chat widgets.
- Prevents database connections and queue from stacking up endlessly and crashing the node while the external vendor is down.

## 2. Tenant Module Toggling
Tenant admins can hide modules from their staff.
If a tenant only wants to use AutopilotMonster as a CRM and hates the AI features, they can toggle "Disable AI" in Workspace Settings.
This flips a flag in the `tenant_settings` JSONB column. The AI button entirely vanishes from the sidebar for their employees, reducing UI clutter.
