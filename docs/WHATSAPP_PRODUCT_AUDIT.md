# WhatsApp product audit

**Snapshot 2026-10-16.** The codebase contains a substantial WhatsApp product surface. Implementation presence is not provider certification or production readiness.

| Capability | State | Evidence and gap |
|---|---|---|
| Provider/account | IMPLEMENTED_UNVERIFIED | Official Meta Cloud API adapter, tenant accounts and phone mapping exist. Meta app/Embedded Signup, scopes, reauthorization and real health not exercised. |
| Messaging/webhooks | IMPLEMENTED_UNVERIFIED | Inbound/outbound/status processing and durable event components exist. Real webhook signatures, delivery ordering, duplicate replay and provider outages not exercised. |
| Inbox | PARTIAL | Conversations, message history, send and assignments exist; complete real-time collaboration, media, collision, SLA and end-to-end usability remain. |
| Templates | PARTIAL | Sync, status and send paths exist; editor/category/media coverage and deleted/paused/rejected provider scenarios need verification. |
| Campaigns | PARTIAL | Queue-driven broadcast, scheduling, consent filtering and pause/recovery paths exist. Frequency caps, budget approval, A/B, timezone, cost, cancellation races and attribution are not all verified. |
| Workflow integration | PARTIAL | WhatsApp triggers/actions and catalog packs reuse the workflow engine. Generic scheduler and event durability are shared blockers. |
| AI automation | PARTIAL | Existing tenant-scoped agents/knowledge and handoff workflow can be reused. Metering/quota race, provider selection, stale KB vectors and unsupported facts remain risks. |
| Catalog/commerce | PARTIAL | Reusable products exist; Shopify cart recovery is explicitly unavailable; some order and commerce paths require scopes, verified identity and real connected store. |
| Consent | IMPLEMENTED_UNVERIFIED | Contact consent/suppression and send checks exist; no production campaign opt-out race exercise was run. CSV import must never manufacture consent. |
| Analytics | PARTIAL | Persisted message/status and campaign data paths exist. Read/conversion/cost/revenue metrics are only available where provider/integration emits reliable evidence; some admin metrics are fabricated. |
| Credential-expiry recovery | IMPLEMENTED_UNVERIFIED | Local change pauses auth-failed broadcasts and resumes eligible rows for the reconnected tenant/phone through the persistent queue; focused regression passes. Provider credential expiry/revocation behavior and Redis/SQL crash reconciliation remain unverified. |

## Specific local changes

The working tree adds a `WhatsappBroadcastRecoveryService`, registers it with the WhatsApp module and invokes it following credential reconnection. Recovery is scoped by tenant and phone number and only selects paused rows with recognized authentication errors. It queues a resume using a unique recovery job ID and preserves scheduled delay. The regression checks cover tenant/phone scoping, job creation and the empty-result path. This is not proof of exactly-once delivery: SQL and Redis are not one transaction, and a durable outbox/reconciler is still required for crash-window guarantees.

## Provider validation still required

Use a non-production tenant and authorized Meta business assets to verify invalid signature rejection, duplicate/out-of-order event processing, token revocation, account reconnect, no send while credentials fail, automatic resume at the stored schedule, opt-out suppression, approved-template enforcement, provider rate limiting, and no duplicate sends after ambiguous responses. No live account was available in this audit.
