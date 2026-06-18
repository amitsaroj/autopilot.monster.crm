# Missing UI Pages Audit

Compared against `Docs/PAGE_LIST.md` and `(app)` user routes.

## Status Summary

- **Documented pages in PAGE_LIST.md:** ~80 admin + marketing routes marked complete
- **Actual frontend routes:** 327+ page.tsx files under `frontend/src/app`
- **Placeholder pages remaining:** ~70 using `PagePlaceholder`
- **Gap type:** Most routes exist; many still need API wiring

## Recently Wired (Sessions 6–7)

| Page | Path | Status |
|------|------|--------|
| Analytics Dashboards | `/(app)/analytics/dashboards` | API wired |
| Analytics Reports | `/(app)/analytics/reports` | API wired |
| Billing Wallet | `/(app)/billing/wallet` | API wired |
| Voice Transcripts | `/(app)/voice/transcripts` | API wired |
| Contact Activities | `/(app)/crm/contacts/[id]/activities` | API wired |
| Contact Deals/Notes/Calls/Emails/Messages/Files | `/(app)/crm/contacts/[id]/*` | API wired |
| Workflow Detail | `/(app)/workflows/[id]` | API wired |
| Workflow Runs | `/(app)/workflows/[id]/runs` | API wired |
| Admin Voice Campaigns | `/admin/voice/campaigns` | API wired |
| Admin AI Agents | `/admin/ai/agents` | API wired |

## Pages Still Using PagePlaceholder (~70)

Key areas: workflow edit/templates, voice/whatsapp nested pages, builder module, CRM leads/deals nested, plugins, inbox, settings notifications/SSO.

## Pages With Hardcoded Mock Data (No PagePlaceholder)

| Page | Path | Issue |
|------|------|-------|
| Workflows List | `/(app)/workflows` | Hardcoded workflows table |
| Admin Workflows Executions | `/admin/workflows/executions` | Mock executions |
| Admin RBAC | `/admin/rbac/*` | Mock roles/users/permissions |
| Admin Social | `/admin/social/*` | Mock posts/assets |
| Admin Voice Numbers | `/admin/voice/numbers` | Mock phone numbers |

## Documented But Still Missing or Partial

| Feature Area | Expected Route | Status |
|--------------|----------------|--------|
| WhatsApp Flow Builder | `/(app)/whatsapp/flows` | Missing |
| Developer Webhooks | `/(app)/settings/webhooks` | Partial in admin settings |
| SSO Settings | `/(app)/settings/workspace/sso` | Placeholder only |
