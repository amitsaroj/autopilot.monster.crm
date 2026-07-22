# Agent 07 — Voice Platform Specialist

**Date:** 2026-07-22  
**Wave:** Voice platform + unblock CRM e2e (TwilioModule DI, webhooks, persistence wiring)  
**Status:** Partial complete — DI fixed, webhook paths corrected, CRM e2e unblocked; several AI stubs remain

---

## P0 — TwilioModule / VoiceCallRepository DI (CRM e2e blocker)

### Root cause
`TwilioService` injected `@InjectRepository(VoiceCall)` inside `TwilioModule`, which did **not** register `TypeOrmModule.forFeature([VoiceCall])`. When `CrmModule` imported `TwilioModule` alone (without `VoiceModule`), Nest could not resolve the repository provider at app bootstrap.

### Fix
- Removed TypeORM persistence from `TwilioService` — it now only wraps the Twilio SDK (single responsibility).
- Call persistence is owned by `VoiceCallService` + `VoiceCallRepository` in `VoiceModule`.
- `CampaignService.startBulkCampaign` now calls `VoiceCallService.initiateOutbound` (via `forwardRef`) instead of `TwilioService.initiateOutboundCall` directly, so bulk CRM campaigns persist call rows.
- `CrmModule` imports `forwardRef(() => VoiceModule)` alongside `TwilioModule`.
- `VoiceModule` exports `VoiceCallRepository` for downstream consumers.

---

## Voice endpoint status

| Area | Route prefix | Status | Notes |
|------|--------------|--------|-------|
| Outbound calls | `POST /api/v1/voice/calls` | ✅ Wired | DTO validated (`CallDto`); persists via `VoiceCallService` |
| Call CRUD | `GET/DELETE /api/v1/voice/calls/:id*` | ✅ Wired | hang-up, transfer, recording, transcript, summary |
| Twilio inbound | `POST /api/v1/voice/twilio/inbound` | ✅ Fixed | Path was `api/v1/v1/voice/twilio/*` — now `api/v1/voice/twilio/*` |
| Routing fallback | `POST /api/v1/voice/twilio/routing-fallback` | ✅ Fixed | Absolute action URL passed from controller |
| Status callback | `POST /api/v1/voice/twilio/status-callback` | ✅ Wired | Updates call + emits `CALL_ENDED` |
| Campaigns | `/api/v1/voice/campaigns/*` | 🟡 Partial | CRUD + start/pause/resume via `VoiceController`; start does not dial contact lists yet |
| Phone numbers | `/api/v1/voice/phone-numbers/*` | ✅ Wired | Search, provision, release via Twilio API |
| Transcripts list | `GET /api/v1/voice/transcripts` | ✅ Wired | Reads persisted transcripts |
| Transcribe | `POST /api/v1/voice/transcribe` | 🟡 Partial | Returns stored transcript by `audioUrl`; no live STT |
| Synthesize | `POST /api/v1/voice/synthesize` | 🔴 Stub | Returns queued placeholder |
| Sentiment | `GET /api/v1/voice/calls/:id/sentiment` | 🔴 Stub | `extractSentimentStub` |
| Clone voice | `POST /api/v1/voice/clone` | 🔴 Stub | Validated DTO; stub ID returned |
| IVR callback | `POST /api/v1/voice/ivr-callback` | 🟡 Partial | `@Public()` + TwiML; basic IVR only |
| Settings | `GET/PATCH /api/v1/voice/settings` | ✅ Wired | Tenant config orchestrator |
| Realtime stream | `WS /voice/stream` | 🟡 Partial | OpenAI realtime when key present; mock key closes connection |

**Duplicate controller:** `VoiceCampaignController` updated with DTOs + permissions but **not registered** — `VoiceController` already exposes the same routes under `/voice/campaigns`.

---

## Module registration

| Module | In `CoreModule` (`app.module.ts`)? | Notes |
|--------|-------------------------------------|-------|
| `VoiceModule` | Yes | Controllers: `TwilioController`, `VoiceController` |
| `TwilioModule` | Via `VoiceModule` + `CrmModule` | Exports `TwilioService` only |
| `QueueProcessorsModule` | Yes | `VoiceQueueProcessor` uses `VoiceCallService` |

---

## Tests run

| Suite | Result |
|-------|--------|
| `nest build` | **PASS** |
| Unit: `voice-call.service.spec.ts` | **5/5 PASS** |
| Integration: `crm-*` + `voice-*` (12 suites) | **35/35 PASS** |

CRM HTTP e2e bootstrap previously blocked by Twilio DI — **now unblocked** (all 12 CRM/voice integration suites green).

---

## Remaining voice gaps (ranked)

1. **P1** — Voice campaign `start()` should enqueue `PROCESS_VOICE` jobs for segment/contact-list members (Bull queue exists; not wired from `VoiceCampaignService.start`)
2. **P1** — Live STT/TTS (OpenAI or Twilio) for `transcribe` / `synthesize` endpoints
3. **P2** — Replace sentiment/clone stubs with real AI pipeline + persist on `VoiceCall`
4. **P2** — Register or delete duplicate `VoiceCampaignController` to avoid drift
5. **P2** — FE voice pages: confirm paths match fixed Twilio webhook URLs after deploy
6. **P3** — Cost metering on `VoiceCall.costAmount`; usage billing integration

---

## Matrix deltas (judgment)

| ID | Before % | After % | Notes |
|----|---------:|--------:|-------|
| F-025 Voice Twilio | 55 | ~70 | DI fix, webhook path, persistence wiring |
| F-010 Contacts (calls) | 75 | ~76 | Bulk campaign calls now persist |
| F-052 Queues | 40 | ~42 | Voice processor confirmed wired in app module |

Still **not ✅ Complete** under full DoD (live STT/TTS, campaign dialer, sentiment/clone real, FE E2E).
