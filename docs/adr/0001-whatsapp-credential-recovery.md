# ADR 0001: Resume eligible WhatsApp broadcasts after credential reconnection

- **Status:** Accepted for local implementation; production verification pending.
- **Date:** 2026-10-16.

## Context

When the official provider rejects an expired/revoked account credential, a broadcast must not continue sending. After the same tenant reconnects the same WhatsApp phone number, eligible auth-paused broadcasts should resume through the existing durable WhatsApp queue and preserve their scheduled time. Recovery must not select another tenant's or phone number's broadcasts.

## Decision

On successful account credential persistence and remote setup, query only paused, undeleted rows for the matching `tenant_id` and `phone_number_id` whose persisted `last_error` matches the known credential-auth failure categories. Transition eligible rows, retain the schedule as a queue delay, and enqueue the existing `broadcast-start` processor. Use a recovery-specific unique Bull job ID so a previously completed/rolled-back queue job cannot prevent a later reconnect attempt from publishing a new start.

## Consequences and limits

- No second scheduler or WhatsApp-specific execution engine is introduced.
- Credentials remain server-side and are not added to the resume payload.
- SQL and Redis are not a shared transaction. A queue job can exist when SQL rolls back; the processor must re-check durable state and a reconciliation/outbox remains required for robust crash-window handling.
- This behavior is locally covered by focused tests, but Meta token expiration/revocation and recovery have not been verified against an authorized business account.
- Do not retry sends whose provider outcome is ambiguous; use existing provider-message state and reconciliation rules.
