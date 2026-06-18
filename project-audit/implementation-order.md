# Implementation Order (Prioritized)

## Phase 1 — Foundation & Data Integrity (P0)

1. **Database migrations** — Initial migration from existing entities
2. **CRM Forecast API** — `/crm/forecast/*` (doc-required, frontend exists with mocks)
3. **Voice call persistence** — Wire Twilio webhooks to `voice_calls` table; real list/detail APIs
4. **API Keys + Webhooks settings** — Entity + `/settings/api-keys`, `/settings/webhooks`
5. **Core unit tests** — ForecastService, VoiceCallService, ApiKeyService

## Phase 2 — Module Completion (P1)

6. **WhatsApp conversations** — Entity, persist inbound, conversation APIs
7. **WhatsApp templates entity** — CRUD + Meta sync stub with real DB
8. **Workflow activate/deactivate/duplicate** — Complete workflow API surface
9. **Analytics endpoints** — overview, crm, revenue, pipeline, team
10. **Billing path aliases** — `/billing/*` controller delegating to monetization
11. **Deal stage/won/lost endpoints** — CRM sales funnel completion
12. **Quote send/accept/PDF** — Quote lifecycle

## Phase 3 — AI & Communication (P2)

13. **AI agents/prompts at `/ai/*`** — Path alignment + prompt CRUD
14. **Knowledge base path alignment** — `/ai/knowledge-bases`
15. **Voice campaigns** — Entity + CRUD + start/pause
16. **Voice phone numbers** — Provision/release
17. **WhatsApp broadcasts** — Entity + send/schedule
18. **SSE streaming chat** — `/ai/chat` streaming

## Phase 4 — Platform & Marketplace (P3)

19. **Marketplace real directory** — Plugin/marketplace entities + install flow
20. **Import/Export jobs** — Async job entities + APIs
21. **Unified search** — `/search` across entities
22. **Storage file APIs** — Presigned URLs
23. **Logs endpoints** — Tenant-scoped audit/API/webhook logs
24. **Wallet/Credits billing** — Entities + APIs

## Phase 5 — Quality & Hardening (P4)

25. **Integration test suite** — Auth, CRM, billing, tenant isolation
26. **E2E smoke tests** — Critical user journeys
27. **Frontend API wiring** — Replace remaining mock data pages
28. **Contact nested routes** — activities, deals, notes per contact
29. **Fine-tuning & embedding management APIs**
30. **SSO configuration endpoints**

## Session 1 Focus (This Run)

Implementing items **2, 3, 4, 5, 6 (partial), 8 (partial), 9 (partial)** and frontend forecast wiring.
