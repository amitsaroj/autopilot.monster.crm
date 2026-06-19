# UI Audit Report — Session 12

**Date:** 2026-06-19  
**Page routes:** 322  
**Build:** PASS (Next.js 16, proxy middleware active)

## Route Coverage

| Area | Pages | Wired to API | Mock/Static | Missing |
|------|-------|--------------|-------------|---------|
| `(app)/` tenant app | ~180 | ~165 | ~15 | 0 |
| `admin/` | ~65 | ~50 | ~15 | 0 |
| `superadmin/` | ~25 | ~20 | ~5 | 0 |
| `(marketing)/` | ~12 | N/A | 0 | 4 |
| `(auth)/` | ~8 | ✅ | 0 | 0 |
| `onboarding/` | ~4 | Partial | 0 | 0 |

## PagePlaceholder Status

**0 active usages** — component exists but all routes replaced (TASK-012 complete).

## UX Patterns

| Pattern | Status |
|---------|--------|
| Loading states | ⚠️ ~60% of data pages |
| Error boundaries | ❌ No shared ErrorBoundary |
| Empty states | ⚠️ Inconsistent |
| Skeleton loaders | ⚠️ Partial (dashboard, CRM lists) |
| Pagination | ✅ CRM lists, admin tables |
| Search/filters | ✅ CRM, partial elsewhere |
| Responsive layout | ✅ Tailwind responsive classes |
| 401 refresh interceptor | ✅ |
| Role-based routing (proxy.ts) | ✅ |

## Domain UI Verdicts

### Landing / Marketing
- Homepage, pricing, 8 product pages: ✅
- SEO metadata: ⚠️ Partial on marketing routes
- **Missing:** `/features`, `/help`, `/api-docs`, `/status`

### Authentication UI
- Login, register, MFA, forgot/reset: ✅
- OAuth buttons: ✅ (backend-dependent)

### CRM UI
- Contacts, companies, deals, pipelines, leads: ✅ CRUD
- Timeline, reports, import/export: ⚠️ Thin data on some subpages
- Lead score page: ⚠️ Placeholder logic

### AI UI
- Agents, chat, KB, prompts, fine-tuning: ✅ pages exist
- Usage page: ⚠️ May show stub backend data

### Voice / WhatsApp UI
- Calls, campaigns, settings: ✅
- Conversation detail: ⚠️ Some hardcoded UI elements
- Flow builder: ⚠️ Partial

### Workflows UI
- CRUD, builder, runs: ✅
- Trigger admin page: ⚠️ Mock trigger list in some admin views

### Billing UI
- Plans, invoices, wallet: ✅ Stripe flow

### Admin UI
- Sessions 10–11 wired many pages to APIs
- **Remaining mock:** ~15 admin pages still reference local `mockData` arrays (rbac/audits, admin/crm/* list pages, workflow executions)

## Accessibility & Performance

| Check | Status |
|-------|--------|
| Semantic HTML | ⚠️ Not audited with axe |
| Keyboard nav | ⚠️ Partial |
| Google Fonts (Inter) | ✅ next/font |
| Image optimization | ✅ next/image where used |
| Lighthouse | ❌ Not run in CI |

## Recommendations

1. TASK-027 — 4 marketing pages
2. Replace remaining admin mockData arrays with service calls
3. TASK-032 — shared EmptyState/ErrorBoundary
4. TASK-028 — Playwright smoke tests for auth + CRM CRUD
5. Audit hardcoded chart data on analytics subpages
