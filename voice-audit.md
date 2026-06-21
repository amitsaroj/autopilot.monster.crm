# Voice Platform Audit

**Date:** 2026-06-19  
**Scope:** `backend/src/modules/voice/**`, Twilio integration, frontend voice pages/services, analytics, tests

## Executive Summary

| Area | Before | After |
|------|--------|-------|
| Backend voice APIs | 26 routes, 3 stubs | 30 routes, core flows wired |
| Twilio integration | Partial webhooks, hardcoded WSS | Tenant-aware routing + upsert |
| Transcripts / summaries | Built in gateway, never persisted | Persisted on disconnect + AI analysis |
| Frontend voice pages | 4 pages on mock data | API-backed calls, analytics, settings |
| Automated tests | 0 voice HTTP tests | 4 integration tests added |

**Overall status:** Core platform operational. Campaign dialer queue and full IVR remain partial.

---

## Feature Matrix

| Feature | Backend | Frontend | Status | Notes |
|---------|---------|----------|--------|-------|
| Outbound AI calls | `POST /voice/calls` | `/voice/calls/new` | Fixed | WSS URL now uses `APP_URL`; voice profile supported |
| Inbound AI calls | `POST /v1/voice/twilio/inbound` | — | Fixed | Tenant resolved from provisioned number; routing fallback added |
| Call list / detail | `GET /voice/calls`, `GET /voice/calls/:id` | `/voice/calls`, `/voice/calls/[id]` | Fixed | Pages now load live data |
| Hang up | `DELETE /voice/calls/:id/hang-up` | Call detail | OK | Twilio call update |
| Call transfer | `POST /voice/calls/:id/transfer` | — | Added | TwiML dial transfer |
| Recordings | `GET /voice/calls/:id/recording` | Call detail audio | Fixed | Player wired when URL exists |
| Transcriptions | `GET /voice/transcripts`, gateway capture | `/voice/transcripts` | Fixed | Transcript persisted from Realtime gateway |
| AI summaries | `GET /voice/calls/:id/summary` | Call detail | Added | `ai_summary` column + GPT analysis |
| Sentiment analysis | Stored on `voice_calls.sentiment` | Analytics + call detail | Added | Derived from transcript analysis |
| Voice profiles | `GET /voice/profiles`, call `voice` param | Settings default profile | Added | OpenAI realtime voices |
| Campaigns CRUD | `/voice/campaigns/*` | `/voice/campaigns` | Partial | CRUD + start/pause/resume; no dial queue |
| Phone numbers | `/voice/phone-numbers/*` | Admin numbers page | OK | Twilio purchase/release |
| Voice settings | `GET/PATCH /voice/settings` | `/voice/settings` | Added | Twilio + routing + default voice |
| Routing | Inbound TwiML + `voice_routing_number` | Settings field | Added | Human fallback then AI stream |
| Analytics | `GET /analytics/voice` | `/analytics/voice` | Fixed | Real KPIs + sentiment breakdown |
| TTS synthesize | `POST /voice/synthesize` | — | Stub | Returns queued placeholder |
| Audio transcribe | `POST /voice/transcribe` | — | Stub | Returns pending placeholder |
| Realtime AI gateway | `/voice/stream` WebSocket | — | Fixed | Persists transcript + analysis on disconnect |

---

## Twilio Module

| Component | Assessment |
|-----------|------------|
| `TwilioModule` | Correctly isolated; exports `TwilioService` |
| `TwilioService` | Tenant credentials via `ConfigOrchestrator`; mock-safe dev mode |
| `TwilioController` | Public webhooks with signature validation |
| Inbound handler | Fixed — resolves tenant, supports human routing fallback |
| Status callback | Fixed — upserts inbound calls when missing |
| Transfer | Added — `transferCall()` via TwiML `<Dial>` |

### Issues fixed

1. Hardcoded outbound WSS host replaced with `APP_URL`-derived stream URL.
2. Inbound calls were not creating `voice_calls` rows — status callback now upserts by Twilio SID.
3. Gateway transcripts were discarded — now saved with AI summary and sentiment.
4. Missing routing path — added `voice_routing_number` setting and `/routing-fallback` endpoint.

---

## Database

### `voice_calls`

| Column | Purpose | Status |
|--------|---------|--------|
| `sid` | Twilio call SID | OK |
| `transcript` | Live AI transcript | Fixed persistence |
| `ai_summary` | GPT call summary | Added |
| `sentiment` | POSITIVE/NEUTRAL/NEGATIVE | Added |
| `voice_profile` | OpenAI voice used | Added |
| `recording_url` | Twilio recording | Webhook updates |

DDL updated in `extended-modules.ddl.ts` with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

---

## Frontend Audit

| Page | Before | After |
|------|--------|-------|
| `/voice` | Mock recent calls | `voiceCallService.list()` |
| `/voice/calls` | Mock table | Live call history |
| `/voice/calls/[id]` | Basic detail | Recording, summary, sentiment |
| `/voice/calls/new` | API wired | Updated initiate payload |
| `/voice/campaigns` | Partial API | Unchanged (already API-backed) |
| `/voice/transcripts` | API wired | OK |
| `/voice/settings` | Tenant settings split | Uses `/voice/settings` |
| `/analytics/voice` | Hardcoded KPIs | Uses `/analytics/voice` |

---

## Tests

| Suite | Coverage |
|-------|----------|
| `voice-http.integration.spec.ts` | Calls list, settings, profiles, analytics |
| Other voice tests | Tenant isolation references `VoiceCall` entity only |

### Gaps remaining

- No webhook signature integration test (Twilio mock token bypass in dev)
- No WebSocket gateway e2e test
- No campaign dial-worker test

---

## Remaining Gaps

1. **Campaign execution** — `VoiceCampaignService.start()` marks RUNNING but does not enqueue outbound dials to contacts.
2. **Recording storage** — Recordings stay on Twilio URLs; no MinIO archival per design doc.
3. **Whisper/Twilio transcribe pipeline** — `POST /voice/transcribe` remains a stub.
4. **TTS** — `POST /voice/synthesize` remains a stub.
5. **Full IVR** — No multi-digit gather menu; routing is single human fallback number.
6. **Per-tenant Twilio webhook auth** — Signature validation still uses global `TWILIO_AUTH_TOKEN`.

---

## Files Changed

### Backend
- `voice-call.entity.ts`, `voice-call.service.ts`, `voice.controller.ts`
- `twilio.controller.ts`, `twilio.service.ts`, `realtime-ai.gateway.ts`
- `lead-intelligence.service.ts`, `voice-phone-number.service.ts`
- `analytics.service.ts`, `extended-modules.ddl.ts`, `dto/voice.dto.ts`

### Frontend
- `voice/page.tsx`, `voice/calls/page.tsx`, `voice/calls/[id]/page.tsx`
- `voice/settings/page.tsx`, `analytics/voice/page.tsx`
- `voice-call.service.ts`, `voice-campaign.service.ts`, `analytics.service.ts`

### Tests
- `backend/test/integration/voice-http.integration.spec.ts`
