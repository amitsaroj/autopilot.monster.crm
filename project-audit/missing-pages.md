# Missing UI Pages Audit

Compared against `Docs/PAGE_LIST.md` and `(app)` user routes.

## Status Summary

- **Documented pages in PAGE_LIST.md:** ~80 admin + marketing routes marked complete
- **Actual frontend routes:** 327+ page.tsx files under `frontend/src/app`
- **Gap type:** Most pages exist as UI shells; many use hardcoded mock data instead of API integration

## Pages With Mock Data (Need API Wiring)

| Page | Path | Issue |
|------|------|-------|
| Revenue Forecast | `/(app)/crm/forecast` | Hardcoded deals array |
| Revenue Forecast (alt) | `/(app)/crm/deals/forecast` | Likely mock data |
| AI Agents | `/admin/ai/agents` | Verify API connection |
| WhatsApp Admin | `/admin/whatsapp/*` | Limited backend |
| Voice Campaigns | `/admin/voice/campaigns` | No backend campaigns |
| Marketplace | `/admin/marketplace` | Backend returns `[]` |

## Documented But Potentially Missing User-Facing Routes

| Feature Area | Expected Route | Found |
|--------------|----------------|-------|
| CRM Leads (user app) | `/(app)/crm/leads` | Yes |
| CRM Segments | `/(app)/crm/segments` | Check |
| CRM Tags | `/(app)/crm/tags` | Check |
| AI Knowledge Base | `/(app)/ai/knowledge-base` | Check |
| AI Prompts (user) | `/(app)/ai/prompts` | Admin only |
| Billing Wallet | `/(app)/billing/wallet` | **Missing** |
| Developer API Keys | `/(app)/settings/api-keys` | **Missing** |
| Developer Webhooks | `/(app)/settings/webhooks` | Partial in admin settings |
| WhatsApp Flow Builder | `/(app)/whatsapp/flows` | **Missing** |
| WhatsApp Broadcasts | `/(app)/whatsapp/broadcasts` | Check |
| Voice Transcripts | `/(app)/voice/transcripts` | **Missing** |
| Analytics Dashboards | `/(app)/analytics/dashboards` | **Missing** |

## Settings Pages (admin/settings/api)

- `/admin/settings/api` exists — needs backend `/settings/api-keys` integration

## Marketing Pages

All documented marketing pages appear present under `(marketing)/`.

## SuperAdmin

Extended beyond PAGE_LIST.md with telemetry, system workers, marketplace sub-pages — all present.

**Estimated pages needing real data integration: ~35**
**Estimated fully missing pages: ~12**
