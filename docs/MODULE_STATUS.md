# Module status

Snapshot 2026-10-16. `VERIFIED` requires passing evidence for the real path; directory/page existence is insufficient.

| Area | State | Known status |
|---|---|---|
| WhatsApp account/provider | IMPLEMENTED_UNVERIFIED | Meta adapter and tenant-account entities exist; real signup, permission, token, capability and credential recovery require provider verification. |
| WhatsApp webhooks/messages | IMPLEMENTED_UNVERIFIED | Webhook/event persistence and queue path exist; signature, delivery idempotency, ordering, replay and live status need verification. |
| WhatsApp inbox/templates | PARTIAL | Inbox and template APIs/UI exist; supported message matrix, template approval edge cases, collision and full media UX incomplete/unverified. |
| WhatsApp campaigns | PARTIAL | Broadcast scheduling, consent and dispatch exist; durable cross-store scheduling, full audience/budget/analytics and live throughput require hardening. |
| WhatsApp automation catalog | PARTIAL | Reusable catalog/workflow integration exists; some products are unavailable or integration-dependent; no blanket install/purchase completeness. |
| CRM | PARTIAL | Deal stages are constrained to their pipeline and contact batch persistence is transactional; focused/full unit suites pass. CSV round-trip, tags/segments API and PostgreSQL tenant/integration checks remain. |
| Workflow engine | PARTIAL | Builder and execution runtime exist; scheduler target no-op and source-event loss window remain. |
| AI/knowledge | PARTIAL | OpenAI and Qdrant paths exist; provider selection, quota races, metering, stale vector deletion and status accuracy remain. |
| Authentication/workspaces | IMPLEMENTED_UNVERIFIED | Core auth, tenant and RBAC code exists; production config, full threat-model and adversarial tests remain. |
| Billing | PARTIAL | Stripe implemented; webhook ordering, state transitions, consistent quotas and real commercial validation remain. |
| Marketplace | PARTIAL | Catalog/install exists; purchase, vendor and actual revenue lifecycle are not complete. |
| Admin/analytics | PARTIAL | Functional APIs coexist with fabricated/static dashboard values and inert controls. |
| Frontend | IMPLEMENTED_UNVERIFIED | Broad app route tree; no browser route-by-route verification in this audit. |
| DevOps/SRE | PARTIAL | CI, Docker, Compose and Terraform exist; production defaults, migration, immutable artifact, backup/restore and alerting gaps remain. |

No area is VERIFIED by this snapshot. See [audit](PROJECT_AUDIT.md), [WhatsApp audit](WHATSAPP_PRODUCT_AUDIT.md), and [known limitations](KNOWN_LIMITATIONS.md).
