# Repository audit

**Snapshot: 2026-10-16.** Read-only audit plus targeted fixes in the current working tree. This is not a release certification. The evidence applies to this checkout and must not be copied to another commit.

## Actual repository shape

- `backend/`: NestJS 11 modular monolith, TypeORM/PostgreSQL, Bull/Redis queues, provider integrations and workers executed in the API process.
- `frontend/`: separate Next.js App Router application; it is not an npm workspace of the backend.
- Root: Docker Compose, Terraform, GitHub Actions, root product README, and canonical lowercase `docs/`.
- Persistence/infrastructure used by code: PostgreSQL, Redis, MinIO/S3 and Qdrant where configured. A local Redis answered `PONG`; PostgreSQL was unavailable (`pg_isready` failed); Compose had no running services during this audit.
- Database migrations: 46 checked-in migration files. The migration graph was not applied to a clean database in this audit.

## Baseline and current verification

Commands, actual results and caveats are maintained in [test results](TEST_RESULTS.md). Initial full backend Jest run failed seven tests in one workflow action suite because its constructor fixture placed the runtime policy in the wrong dependency position. The fixture was corrected. At this tree, backend full Jest passed 34 suites / 199 tests; frontend typecheck/lint/tests/build passed; backend typecheck/build passed, as recorded in the test results.

Production dependency audit before fixes reported backend 53 findings (1 critical, 24 high, 27 moderate, 1 low) and frontend 30 (1 critical, 11 high, 17 moderate, 1 low). Current `npm audit --omit=dev` reported frontend zero and backend 12 moderate, zero high/critical. Aligning `@nestjs/common` with the resolved 11.2.7 core fixed a runtime module mismatch caused by the updated lock. Re-run audits at the final lock state before using these counts.

Lint commands passed with warnings (backend 277, frontend 1,833 in the observed baseline); warnings are not represented as clean lint. Runtime builds and live external-provider validation were not yet established by the baseline.

## Module inventory (source audit; not end-to-end verification)

| Module | State | Evidence / primary gap |
|---|---|---|
| WhatsApp | PARTIAL | Account, official Meta adapter, webhook, inbox, template, broadcast, analytics and automation code exist. Real Meta onboarding/send/status validation requires configured app, credentials, callback and approved business assets. See [product audit](WHATSAPP_PRODUCT_AUDIT.md). |
| CRM | PARTIAL | Contacts, companies, leads, deals, pipelines and activities exist; deal-stage pipeline consistency is checked in the service; contact bulk imports use one transaction. PostgreSQL rollback integration and CSV correctness remain unverified. |
| Workflow | PARTIAL | Builder/runtime and WhatsApp actions exist; generic scheduler target is a no-op and several event dispatch paths are not durably recoverable. |
| AI / knowledge | PARTIAL | Tenant-scoped agents and Qdrant-backed retrieval paths exist; provider selection, key-cache rotation, quota reservation and vector deletion/status accuracy need work. |
| Auth / workspace | IMPLEMENTED_UNVERIFIED | Registration, JWT, RBAC, tenant and verification flows exist; full adversarial, session lifecycle and production configuration verification is outstanding. |
| Billing | PARTIAL | Stripe-backed subscription/entitlement code exists; webhook transition ordering, cancellation state consistency, and usage integration need verification. Razorpay/PayPal are not implemented end-to-end. |
| Marketplace | PARTIAL | Catalog/install endpoints exist; premium purchase flow, vendor operations and actual revenue reporting are incomplete. |
| Admin / analytics | PARTIAL | APIs/pages exist; several admin and analytics pages report static or derived values as live. |
| DevOps / SRE | PARTIAL | Compose, Terraform and GitHub Actions exist; unsafe production defaults, missing DB tools in API image, mutable tags and absent verified restore/alerting evidence remain. Backend/frontend typecheck and lint steps were added to CI locally; GitHub-hosted CI has not run this patch. |
| Frontend | IMPLEMENTED_UNVERIFIED | Broad route tree and API clients exist; public pricing now renders configured public billing plans rather than hardcoded amounts/features. Static audit still found other fabricated admin stats/dead controls and plan selection does not continue through signup/checkout. Browser route-by-route verification was not performed. |

No module above is marked VERIFIED because this audit did not prove a complete authorized production-like workflow with persistence, permissions, integrations and recovery.

## Top 20 prioritized work items

| Rank | Priority | Work item | Evidence / acceptance |
|---:|---|---|---|
| 1 | P0 | Replace production Compose default DB/Redis/MinIO credentials and make secret injection fail closed | Deployment dry-run with no secret values; owner-controlled rotation and successful target health check |
| 2 | P0 | Resolve unsafe auto-apply deployment on `main`; require verified CI, immutable artifact and explicit environment gate | CI/deploy workflow inspection and non-production rollout/rollback |
| 3 | P0 | Audit tenant/object authorization and all request-body tenant overrides | Adversarial integration tests against PostgreSQL with global guards |
| 4 | P0 | Restore verified secret history and rotate potentially exposed credentials | Owner confirms rotation/revocation; repository history remediation requires explicit authorization |
| 5 | P1 | Validate full WhatsApp credential-expiry → pause → reconnect → resume lifecycle | Focused regression plus non-production Meta token revoke/restore exercise |
| 6 | P1 | Make WhatsApp queue scheduling recoverable across SQL/Redis failure | Durable outbox or reconciliation, duplicate and crash-window exercise |
| 7 | P1 | Complete Meta Embedded Signup, scopes, webhook subscription and capability checks | Real authorized Meta business account smoke |
| 8 | P1 | Ensure webhook intake durable, signed, idempotent, replayable and tolerant of out-of-order status | Invalid signature, duplicate, out-of-order and retry integration verification |
| 9 | P1 | Validate campaign consent, window/template, suppression and opt-out at dispatch time | Pending campaign opt-out race regression on DB+queue |
| 10 | P1 | Complete inbox assignment/collision, pagination, media and send-window UX | API/UI integration and two-agent manual verification |
| 11 | P1 | Validate provider-aware rate limits, unknown-send reconciliation and retry policy | Fault-injection/Meta sandbox and no duplicate external send evidence |
| 12 | P1 | Reconcile billing webhooks and automation entitlements atomically/idempotently | Stripe test-mode lifecycle/replay verification |
| 13 | P1 | Fix CRM deal stage pipeline invariant and transactional contact imports | DB integration regression and CSV round-trip cases |
| 14 | P1 | Make workflow event dispatch durable and scheduler actually execute targets once | Redis/Postgres outage, multi-replica and scheduled action checks |
| 15 | P1 | Validate new backend/frontend typecheck and lint CI gates; invoke integration suite intentionally | GitHub CI run with provisioned PostgreSQL and failure-on-skip semantics |
| 16 | P1 | Carry public plan selection through signup and implement premium marketplace checkout | Browser signup→selected plan→configured checkout→entitlement flow with actual billing config |
| 17 | P2 | Centralize AI quota reservation/metering and invalidate provider cache on rotation | Concurrent quota and key-rotation tests across AI/voice paths |
| 18 | P2 | Delete Qdrant vectors on KB/document deletion and report partial ingestion truthfully | Tenant-scoped vector deletion and failed-chunk integration checks |
| 19 | P2 | Replace fabricated admin/billing/marketplace metrics and dead controls | API-backed UI review; unavailable actions visibly disabled |
| 20 | P2 | Establish backup restore, alerting, queue recovery and capacity baselines | Dated restore drill, configured alert exercise and representative load results |

## Multi-agent audit and coordination

Twelve specialist reviews were dispatched in sequential waves because the runtime exposed six concurrent slots. Ownership was read-only and disjoint: architecture, WhatsApp, security, backend/database, frontend, workflow, AI/knowledge, CRM, billing, QA, DevOps and product/admin. Reports were integrated as evidence, not accepted as verification. The lead retains shared-file and release ownership; no agent was permitted to deploy or edit production configuration.

## Scope limits

No production credentials, Meta account, Stripe test account, Shopify store, production host, or database was available/used. No deployment, live message, billing operation, destructive migration, or history rewrite was performed. See [known limitations](KNOWN_LIMITATIONS.md).
