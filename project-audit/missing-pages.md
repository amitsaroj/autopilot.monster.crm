# Missing UI Pages Audit

**Audit date:** 2026-06-18 (Session 11)  
Compared against `Docs/PAGE_LIST.md` and `frontend/src/app/`

## Summary

| Metric | Count |
|--------|-------|
| Total frontend routes (`page.tsx`) | 329 |
| PagePlaceholder component usages | **0** (component exists, unused) |
| Admin pages with hardcoded mock data | **0** (TASK-015 complete) |
| Superadmin pages with inline mock arrays | **0** (TASK-016 complete) |
| Documented marketing pages missing | **4** |
| WhatsApp Flow Builder route | **Missing** |

## Admin Pages — Mock Data (TASK-015) ✅ Complete

| Page | Path | Backend API | Status |
|------|------|-------------|--------|
| CRM Products | `/admin/crm/products` | `GET /crm/products` | ✅ Wired |
| CRM Quotes | `/admin/crm/quotes` | `GET /crm/quotes` | ✅ Wired |
| CRM Support | `/admin/crm/support` | `GET /support/tickets` | ✅ Wired |
| CRM Search | `/admin/crm/search` | `GET /search` | ✅ Wired |
| CRM Documents | `/admin/crm/documents` | `GET /storage/files` | ✅ Wired |
| CRM Inbox | `/admin/crm/inbox` | `GET /whatsapp/conversations` | ✅ Wired |
| CRM Emails | `/admin/crm/emails` | `GET /crm/emails` | ✅ Wired |
| CRM Knowledge Base | `/admin/crm/kb` | `GET /support/articles` | ✅ Wired |
| AI Prompts | `/admin/ai/prompts` | `GET /ai/prompts` | ✅ Wired |
| AI Conversations | `/admin/ai/conversations` | `GET /ai/conversations` | ✅ Wired |
| RBAC Users | `/admin/rbac/users` | `GET /users` | ✅ Wired |
| Workflow Triggers | `/admin/workflows/triggers` | `GET /workflows/workflow-triggers` | ✅ Wired |
| Voice Numbers | `/admin/voice/numbers` | `GET /voice/phone-numbers` | ✅ Wired |
| Social Feed | `/admin/social/feed` | `GET /social/posts` | ✅ Wired |
| Social Media | `/admin/social/media` | `GET /storage/files` | ✅ Wired |

## Already Wired (Sessions 6–9)

- All `(app)/*` user routes — 322 routes build clean
- Admin: AI Agents, Voice Campaigns, RBAC Roles/Permissions/Audits, Billing History/Methods, Workflow Executions
- CRM contact nested pages, analytics dashboards/reports, billing wallet, voice transcripts

## Superadmin — Inline Mock Data (TASK-016) ✅ Complete

| Page | Path | Backend API | Status |
|------|------|-------------|--------|
| Infrastructure | `/superadmin/infra` | `GET /admin/health` | ✅ Wired |
| System Queues | `/superadmin/system/queues` | `GET /admin/queues` | ✅ Wired |
| System Storage | `/superadmin/system/storage` | `GET /admin/storage/stats` | ✅ Wired |
| System Workers | `/superadmin/system/workers` | `GET /admin/workers/status` | ✅ Wired |
| Marketplace Catalog | `/superadmin/marketplace/catalog` | `GET /admin/marketplace/plugins` | ✅ Wired |
| Marketplace Monetization | `/superadmin/marketplace/monetization` | `GET /admin/billing/stats`, `GET /monetization/admin/invoices` | ✅ Wired |

## Documented But Missing Routes

| Feature | Expected Route | Status |
|---------|----------------|--------|
| WhatsApp Flow Builder | `/(app)/whatsapp/flows` | Missing |
| Developer Webhooks UI | `/(app)/settings/webhooks` | Partial (in `/settings/api`) |
| Marketing Features | `/features` | Missing |
| Help Center | `/help` | Missing |
| API Docs | `/api-docs` | Missing |
| Status Page | `/status` | Missing |

**Pages needing API wiring: 0 (admin + superadmin complete)**
