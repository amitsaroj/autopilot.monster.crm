# Combined Features (Modules Matrix)
Project: autopilot.monster.crm

---

## 1. Feature Matrix Definition

A tenant's capabilities are a combination of:
1. Their `plan_id` (e.g., Pro unlocks 15 base feature flags).
2. Their active `add_ons` (e.g., User bought the "Storage Pack").
3. Super Admin `overrides` (e.g., Extended a beta feature to them).

## 2. The Features Object (JWT vs Local)
Because JWT size matters (max HTTP header size limits), we **do not** embed the massive array of enabled features inside the Auth JWT.
Instead:
- The JWT contains only `tenant_id`, `user_id`, `role`.
- The Next.js frontend fetches `GET /v1/tenant/context` on bootstrap.
- The context object contains the boolean map of features, which powers the sidebar visibility and internal component logic locally.

```json
{
  "features": {
    "crm": true,
    "voice": false,
    "whatsapp": true,
    "workflows": true,
    "custom_reporting": false
  }
}
```
