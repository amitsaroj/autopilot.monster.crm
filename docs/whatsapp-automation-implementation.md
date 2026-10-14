# WhatsApp automation implementation checkpoint

Updated 14 October 2026. This is an implementation checkpoint, not a declaration that the entire master product scope is complete.

## Customer lifecycle

Public discovery: `/product/whatsapp/automations` and `/product/whatsapp/automations/:slug`.
Workspace catalog/setup: `/whatsapp/automations` and `/whatsapp/automations/:slug`.
Installed products: `/whatsapp/automations/installed`.
Per-installation history: `/whatsapp/automations/installed/:id`.
Custom graph editor: `/whatsapp/flow-builder`.

The catalog and configuration screens read real backend definitions, marketplace rows and workspace resources. Installation creates a linked draft in the existing workflow engine. Configure returns that installation to draft; activation atomically publishes a pinned workflow version and marks the installation active. Pausing/uninstalling retains executions and purchased entitlements. Paid products use the existing billing Stripe client and signed webhook entitlement handling. Checkout return pages do not grant access.

Preview validates configuration and resolves sample trigger data without invoking message providers, AI generation, CRM writes or payment operations. Outputs of previous actions are explicitly deferred in previews, not presented as generated results. Production actions reject missing workflow variables and validate resolved tenant resource references. WhatsApp sends carry the durable execution step idempotency key.

## New API contracts

All paths are under `/api/v1`; normal response envelopes apply. Authenticated endpoints require existing tenant/auth/marketplace permissions. Workflow endpoints retain their workflow plan and permission guards.

| Method / path | Request | Response |
| --- | --- | --- |
| GET `/whatsapp-automations/catalog` | Optional `category`, `search` | Public catalog with availability, requirements, config schema, pricing model |
| GET `/whatsapp-automations/catalog/:slug` | None | Product definition for setup |
| POST `/whatsapp-automations/catalog/:slug/preview` | `{ config, payload? }` | `{ valid, errors, warnings?, preview?, readiness }`; no actions executed |
| POST `/whatsapp-automations/catalog/:slug/install` | `{ config }` | Draft installation; validates ownership and entitlement |
| POST `/whatsapp-automations/catalog/:slug/checkout` | None | Configured Stripe checkout URL and provider pricing; no entitlement granted by this request |
| GET `/whatsapp-automations/installed` | None | Tenant installations with readiness and database execution totals |
| PATCH `/whatsapp-automations/installed/:id/config` | `{ config }` | Updated draft installation |
| POST `/whatsapp-automations/installed/:id/activate` | None | Active installation after publication validation |
| POST `/whatsapp-automations/installed/:id/disable` | None | Disabled installation |
| DELETE `/whatsapp-automations/installed/:id` | None | Uninstalled state; history and entitlement retained |
| GET `/whatsapp-automations/installed/:id/executions` | None | Latest 100 executions for the owned linked workflow |
| POST `/whatsapp-automations/installed/:id/run` | `{ payload, requestId }`; UUID v4 request ID | Starts an active manual automation using the request ID for deduplication; supplying contactId hydrates the current tenant-owned CRM contact |
| POST `/workflows/preview` | `{ definition, payload? }` | Workflow structural/resolution preview |
| POST `/workflows/:id/preview` | `{ payload? }` | Stored workflow preview |
| GET `/workflows/:id/versions` | None | Latest 100 published snapshots |
| POST `/workflows/executions/:execId/pause` | None | Manually pauses an idle queued/waiting execution |
| POST `/workflows/executions/:execId/resume` | None | Resumes a manually paused execution, retaining its original scheduled time |
| POST `/workflows/executions/:execId/cancel` | None | Cancels an idle execution; a running side effect cannot be interrupted |
| POST `/whatsapp/send-content` | `{ to, content, wabaId?, idempotencyKey?, expectedLastOutboundId? }` | Supported media reference or interactive send, subject to service window, consent and provider validation |
| PATCH `/whatsapp/conversations/:phone` | `{ status?, priority?, tags? }` | Updates the tenant CRM contact's conversation state, priority and labels |
| POST `/whatsapp/conversations/:phone/read` | None | Records the team's read timestamp |
| GET / POST `/whatsapp/conversations/:phone/notes` | POST `{ content }` | Reads or creates WhatsApp-tagged CRM internal notes; never sends notes to Meta |

Installation configuration accepts only fields declared by the selected product schema. Unknown fields and unowned resources are rejected. Basic template packs currently support approved BODY-only templates with correctly ordered text parameters. Account credentials are never part of catalog/setup responses.

## Feature matrix against the master scope

| Area | Current implementation | Still missing / dependent |
| --- | --- | --- |
| A: AI assistants | Existing agent/KB/provider reused by AI_CHAT; text knowledge assistant pack; quota metering and human fallback | Live AI/Qdrant verification; contextual history/media reasoning; specialized commerce/booking agents and broader action tools |
| B: team inbox | Tenant inbox/replies, assignment, resolution/reopening, statuses, service-window controls, CRM internal notes/tags/priority, team read timestamp and optimistic outbound collision guard | Presence, skill/round-robin routing, SLA escalation, merge/export/CSAT |
| C: campaigns | Existing approved-template broadcasts, recipient eligibility, scheduling, preview, pause/resume/cancel, throttling and persisted recipient outcomes | Recurrence, recipient timezones, frequency caps, approvals, budgets, A/B measurement and trustworthy attribution |
| D: sequences | Shared graph, branches, durable delay/reply/condition waits, pinned snapshots/checkpoints/retries; opt-out, configured reply/conversion/goal termination; timezone/DST-aware business hours; idle-run pause/resume/cancel | Advanced entry criteria, per-recipient timezone, richer sequence UX; goal condition currently configured through the API |
| E: visual builder | WhatsApp keyword graph with node fields, explicit branch handles, draft/preview/publish, sending account selection and run links | Undo/redo, broader trigger selector, advanced typed personalization/tool controls and richer validation highlighting |
| F: commerce | Shopify recovery explicitly unavailable | Shopify/WooCommerce verified connections, events, requester authorization and accurate order/catalog actions |
| G: lead/sales | CRM contact capture, teammate handoff, tasks and deal-stage notification packs | Attribution, phone-only contact capture/deduplication, configurable qualification/scoring and sales round-robin |
| H: bookings | Appointment-request task intake clearly described as intake | Actual booking/calendar adapters, timezone-safe reminders and cancellation rescheduling |
| I: payments | Existing platform Stripe entitlement path; payment-instructions reply uses maintained links | Customer payment/invoice provider events and adapters; no claim of native WhatsApp payment support |
| J: retention | Manual marketing-template follow-up with purpose-specific consent checks | Event-driven lifecycle packs, frequency/suppression preferences and outcome tracking |
| K: industries | Shared engine available for configurable packs | Curated industry packs; healthcare/financial jurisdiction and security review |
| L: notifications | Internal team-alert pack and template infrastructure | Curated authentication/utility product packs and account/security event wiring |
| M: messaging | Meta adapter/capability registry; official text/template, media-reference and interactive button/list API paths; media/button inbox composer | Media upload/download/preview, list composer, flows and commerce messages |
| N: contacts/consent | CRM contacts reused; purpose/source/evidence consent records; opt-out suppression checked on sends | Preferences/timezone/language UX, consent import validation and advanced suppression management |
| O: templates | Existing create/preview/sync/refresh/status/rejection UI; approval enforced on sends | Full header/buttons support, provider reconciliation and template dependency/change history UX |
| P: integrations | Existing marketplace/plugin/billing models reused; tenant Meta accounts, CRM, workflow and AI | Commerce/scheduling/Sheets/Calendar/Zapier/Make connections, health/scope/revocation lifecycle |
| Q: developer API | Existing auth/RBAC/rate-limits and WhatsApp/workflow API paths; persisted idempotency identities and histories | Complete service-auth/scoped-key coverage and outbound event replay tooling audit |

Catalog implementation currently has 12 installable packs and one unavailable Shopify pack. An installable pack still requires its stated plan features, connection, approved template or AI infrastructure; this label does not establish live provider verification. The manual follow-up setup page includes a workspace-contact selector and explicit real-send confirmation; retries reuse a request UUID.

## Verification and deployment

Six existing WhatsApp migrations (1740000000013 through 1740000000018) were successfully applied to the local development database with synchronization disabled. Production migration rollout remains required. The local database originally lacked these tables and had zero published workflows. A dedicated backend build config now emits `dist/main.js` as expected by the existing start/Docker commands.

Backend and frontend TypeScript checks and production builds passed. The existing workflow test suite passed all 12 cases; fixtures were updated for new dependency injection, with no new test cases. Inline sequence assertions passed for weekday scheduling, daylight-saving transitions, invalid policy rejection, opt-out suppression and wait timeout.

Both applications now have ESLint flat configuration and `npm run lint:check`. Frontend ESLint was aligned to version 9 for compatibility with its installed Next/React plugins. Full-app lint passes with zero errors; the recorded baseline is 380 backend warnings and 1,845 frontend warnings. Existing React migration findings and legacy types remain warnings outside WhatsApp, not silently disabled. Scoped WhatsApp/workflow backend and WhatsApp frontend lint pass with zero errors and zero warnings; production files prohibit explicit `any`. Frontend also exposes `npm run typecheck`.

Reply waits retain action-level plan/reference checks, and custom WhatsApp workflows check the WhatsApp entitlement before publishing/executing. Idle controls use conditional database updates and dispatch generations; cancellation is not counted as a successful completion. The backend build and all 12 existing workflow cases were rerun successfully after the final entitlement correction.

This turn's rebuilt API smoke check confirmed HTTP 200 for public catalog, authenticated conversations, installation listing and builder palette, plus HTTP 201 / valid=true for a business-hours sequence preview. The API was started temporarily on loopback and stopped after checking; no provider action ran. The new note/media/collision APIs compile and enforce validation but were not exercised with a live connected Meta account or simultaneous browser agents.

The rebuilt API was started temporarily on loopback port 8083 against the migrated local database and Redis. Public catalog returned HTTP 200 with 13 products / 12 installable entries. Demo tenant-admin login succeeded; installation listing returned HTTP 200; authenticated workflow preview returned HTTP 201, valid=true, with the sample phone variable resolved. Every installable catalog definition compiled through the shared compiler. No message/provider action was invoked. Qdrant reported a client/server minor-version compatibility warning. The temporary API stopped after its verification timeout.

Live Meta account validation, inbound signed webhook processing, real outbound delivery, AI inference, Stripe paid/refund/subscription entitlement transitions, provider outage recovery and the remaining integration capabilities require further runtime verification. No production rollout or real customer messages/charges are claimed by this checkpoint.
