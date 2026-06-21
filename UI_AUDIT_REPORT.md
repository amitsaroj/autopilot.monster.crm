# UI Audit Report — Session 7

**Date:** 2026-06-18

## Route Inventory

| Area | Pages | API-backed | Mock/Placeholder | Hardcoded |
|------|-------|------------|------------------|-----------|
| Tenant `(app)` | 170 | ~55 | 72 (PagePlaceholder) | ~15 |
| Admin | 79 | ~40 | 22 (mock const) | ~10 |
| SuperAdmin | 28 | ~20 | 2 (infra, telemetry) | 1 (chart dummy) |
| Marketing | 25 | N/A | 0 | Static content |
| Auth/Onboarding | 10 | ~6 | 0 | 0 |
| **Total** | **322** | **~121 (38%)** | **74 (23%)** | **~26 (8%)** |

## PagePlaceholder Routes (72)

All under `(app)/`: builder (11), CRM nested (35), AI detail (8), voice detail (6), whatsapp detail (5), workflows detail (5), analytics (2), billing invoice detail, plugins, inbox, storage, settings SSO/notifications.

## Mock Data Admin Pages (22)

workflows/triggers, workflows/executions, voice/numbers, social/feed, social/media, rbac/* (4), crm/support, quotes, search, products, emails, kb, documents, inbox, billing/methods, billing/history, ai/prompts, ai/conversations, superadmin/infra, superadmin/telemetry

## Auth & Guards

- `proxy.ts` active as Next.js 16 edge middleware
- Layout guards: `(app)`, `admin`, `superadmin`
- Onboarding unguarded (client-only)
- No per-permission route blocking

## Missing Pages (documented, not built)

- `/features`, `/help`, `/api-docs`, `/status`, `/enterprise`, `/startups`
- `/superadmin/security` (exists at `/superadmin/settings/security`)

## UX Patterns

| Pattern | Coverage |
|---------|----------|
| Loading spinners | Good on API pages |
| Error UI | Weak (toast/console) |
| Empty states | Partial, no shared component |
| Pagination | Partial |

## UI Completion: ~58%
