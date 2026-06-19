# Pending Features Audit

**Audit date:** 2026-06-19 (Session 12)  
**Source of truth:** `Docs/` vs codebase

## Summary

| Module | Implemented | Partial | Missing | Notes |
|--------|-------------|---------|---------|-------|
| CRM | 18 | 6 | 2 | Core CRUD complete |
| AI | 10 | 4 | 2 | Usage metering broken |
| Voice | 8 | 4 | 3 | Webhooks hardened S12 |
| WhatsApp | 7 | 4 | 3 | Webhooks hardened S12 |
| Workflows | 8 | 2 | 0 | Actions don't execute |
| Billing | 9 | 2 | 2 | Stripe only |
| Analytics | 10 | 2 | 1 | Export pipeline thin |
| Marketplace | 3 | 2 | 2 | Install partial |
| SaaS/RBAC | 8 | 3 | 1 | 55/109 controllers ResourcePerm |
| Developer | 5 | 2 | 1 | SDK/OAuth apps missing |
| Infrastructure | 4 | 4 | 2 | Migrations + RS256 |

**Total pending/partial: ~48**

## CRM — Partial / Missing

| Feature | Status |
|---------|--------|
| Lead scoring rules engine | Partial |
| Full-text search (tsvector) | Partial — ILIKE |
| CRM event naming (`crm.*`) | Missing |

## AI — Partial / Missing

| Feature | Status |
|---------|--------|
| AI usage metering | Broken — stub |
| Agent handoff endpoint | Missing |
| Embedding management API | Missing |

## Voice — Partial / Missing

| Feature | Status |
|---------|--------|
| Call sentiment | Missing |
| Post-call AI summaries | Missing |
| Voice profiles | Missing |

## WhatsApp — Partial / Missing

| Feature | Status |
|---------|--------|
| Flow Builder dedicated routes | Partial |
| Conversation assign/resolve | Missing |
| WA number registration API | Missing |

## Billing — Partial / Missing

| Feature | Status |
|---------|--------|
| PayPal / Razorpay | Missing |
| LimitGuard global | Missing |

## Security — Partial

| Feature | Status |
|---------|--------|
| RS256 JWT production default | Partial — config exists |
| PermissionGuard full coverage | Partial — 55/109 |
| Domain verification | Done — real DNS |

## Marketing — Missing

| Page | Status |
|------|--------|
| `/features` | Missing |
| `/help` | Missing |
| `/api-docs` | Missing |
| `/status` | Missing |

## Admin UI — Remaining Mock

~15 admin pages still use local mockData arrays (rbac audits, admin/crm list views, workflow executions).
