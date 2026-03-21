# Pricing Scope Documentation
Project: autopilot.monster.crm

---

## 1. Definition of "Billable Scope"
A billable entity is any unit of measure that decrements the balance or increments overage charges for a Tenant.

### 1.1 In-Scope (Metered)
- Outbound SMS / WhatsApp messages.
- Inbound & Outbound Calling minutes.
- LLM Token requests (Input + Output tokens combined into a metric using a multiplier).
- Storage buckets scaling beyond base plan limits.

### 1.2 In-Scope (Hard Limits)
- Active User Seats (Admins + Agents).
- Total Contact Rows (`deleted_at IS NULL`).
- Configured AI Agents (Active or Paused).

### 1.3 Out of Scope (Free, usage not tracked)
- Daily API requests (subject to rate limiting, not billing).
- Internal system emails (password resets, notifications).
- Internal task assignments and workflow steps running without external HTTP/API side-effects.
- Audit logs processing.
