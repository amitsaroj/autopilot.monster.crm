# Analytics Audit Report

**Date:** 2026-06-19  
**Scope:** Backend `analytics` module, frontend analytics pages, integration tests  
**Agent:** AGENT 12 — ANALYTICS AUDITOR

---

## Executive Summary

Analytics had a working backend API layer but most frontend subpages displayed hardcoded mock data. CRM summary calculations used incorrect deal-stage logic (`stageId === 'won'` instead of `DealStatus.WON`). Several analytics domains (AI usage, WhatsApp, forecast) were missing from the unified analytics API or frontend.

**Status after fixes:** Backend endpoints verified and extended; frontend pages wired to live APIs; critical CRM calculation bugs fixed; integration tests added.

---

## Backend Audit

### Module Structure

| File | Role | Status |
|------|------|--------|
| `analytics.controller.ts` | KPI endpoints | Fixed — added `@PlanFeature('analytics')`, `/ai`, `/forecast` |
| `analytics.service.ts` | Data aggregation | Fixed — added AI usage + forecast delegation |
| `analytics-reports.controller.ts` | Report CRUD + run | OK |
| `analytics-dashboards.controller.ts` | Dashboard CRUD | OK |
| `analytics-report.service.ts` | Report execution | Fixed — AI + FORECAST report types |
| `analytics-dashboard.service.ts` | Dashboard persistence | OK |
| `analytics.module.ts` | DI wiring | Fixed — UsageRecord, Message, CrmModule import |

### Endpoint Coverage

| Endpoint | Purpose | Pre-audit | Post-audit |
|----------|---------|-----------|------------|
| `GET /analytics/overview` | Dashboard KPIs | OK | OK |
| `GET /analytics/crm` | CRM KPIs | OK | OK |
| `GET /analytics/revenue` | MRR/ARR | OK | OK |
| `GET /analytics/pipeline` | Stage funnel | OK | OK |
| `GET /analytics/team` | Rep performance | OK | OK |
| `GET /analytics/voice` | Call metrics | OK | OK |
| `GET /analytics/whatsapp` | Message metrics | OK | OK |
| `GET /analytics/ai` | AI usage | Missing | Added |
| `GET /analytics/forecast` | Weighted forecast | Missing | Added |
| `GET /analytics/metrics` | Time-series metrics | OK | OK |
| `GET/POST /analytics/reports/*` | Custom reports | OK | OK |
| `GET/POST /analytics/dashboards/*` | Custom dashboards | OK | OK |

### Critical Backend Bug Fixed

**`AnalyticsCrmService` (`crm-support.service.ts`)** compared `deal.stageId` (UUID) to string literals like `'won'`. This caused win rate always 0, revenue counting all deals, and empty pipeline stages.

**Fix:** Use `DealStatus.WON` and load `stage` relation for pipeline grouping.

### AI Usage

- `/ai/usage` (RagService) returned hardcoded stub
- New `/analytics/ai` reads `usage_records` and falls back to assistant message count

### Forecasting

Added proxy at `/analytics/forecast` delegating to `ForecastService`. CRM forecast pages at `/crm/forecast` unchanged.

---

## Frontend Audit

| Page | Route | Pre-audit | Post-audit |
|------|-------|-----------|------------|
| Overview | `/analytics` | Mock data | Live API |
| Revenue | `/analytics/revenue` | Mock data | Live API |
| CRM | `/analytics/crm` | Live API | OK |
| Pipeline | `/analytics/pipeline` | Mock data | Live API |
| Team | `/analytics/team` | Mock data | Live API |
| Voice | `/analytics/voice` | Mock data | Live API |
| WhatsApp | `/analytics/whatsapp` | Missing | Created |
| Export | `/analytics/export` | CRM export | OK |
| Dashboards | `/analytics/dashboards/*` | Live API | OK |
| Reports | `/analytics/reports/*` | Live API | OK |

---

## Tests

| Test File | Coverage |
|-----------|----------|
| `analytics-reports-http.integration.spec.ts` | Report CRUD + run |
| `analytics-http.integration.spec.ts` | All KPI endpoints (added) |
| `whatsapp-http.integration.spec.ts` | WhatsApp analytics |
| `forecast.service.spec.ts` | Weighted forecast math |

---

## Fixes Applied

1. Fixed `AnalyticsCrmService` deal status and pipeline stage logic
2. Added `GET /analytics/ai` and `GET /analytics/forecast`
3. Added `@PlanFeature('analytics')` to main analytics controller
4. Extended report types: `AI`, `FORECAST`
5. Rewired frontend analytics pages to live APIs
6. Created `/analytics/whatsapp` page
7. Expanded frontend `analytics.service.ts`
8. Added `analytics-http.integration.spec.ts`

---

## Remaining Gaps

1. `/ai/usage` RagService still returns stub — use `/analytics/ai` instead
2. Team table shows owner UUID, not display name
3. Admin analytics pages use unauthenticated raw fetch
4. No dedicated `/analytics/export` async job endpoint
