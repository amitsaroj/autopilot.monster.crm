# Internal Admin Tools
Project: autopilot.monster.crm

---

## 1. Scope of the Internal Admin

The `/admin` UI is exclusively accessible to users with `is_super_admin = true` on their Root User record.
It bypasses standard Tenant logic.

## 2. Core Dashboard Panels

### 2.1 Tenant Manager
- **Impersonate:** Admins can generate a short-lived impersonation JWT to view the CRM exactly as a specific user sees it (for troubleshooting). All actions log distinctly in the Audit Trail with an `impersonator_id`.
- **Force Logout:** Immediately revokes all sessions for a Tenant.
- **Suspend / Unsuspend.**

### 2.2 System Pricing Switchboard
- Modify `plan_features` globally.
- Push Tenant Overrides (Custom Enterprise limits).
- View aggregate Stripe MRR syncs.

### 2.3 Queue & Background Jobs Monitor
Embedded BullMQ Dashboard to track the active job pipelines:
- Inspect failed emails.
- Review Dead Letter Queues (DLQ).
- Manually trigger `retryAll` for failed webhooks.

## 3. Security Requirements
Because the Admin Tool has God Mode access to all tenant data:
- MFA is rigorously enforced on every Admin login (SMS + Authenticator).
- Allowed only via Corporate VPN / Zero Trust Access overlay.
