# Autopilot Monster implementation ledger

**Updated:** 2026-10-16. This ledger is tied to the current local working tree, not a release commit. No deploy or push was performed. Detailed audit evidence: [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md); readiness: [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md).

Status values: `NOT_STARTED`, `PARTIAL`, `IMPLEMENTED_UNVERIFIED`, `VERIFIED`, `BLOCKED`, `DEPRECATED`. VERIFIED requires command/manual evidence for the behavior described.

| ID | Priority | Module | Task | Owner | Dependencies | Status | Tests / evidence | Blocker |
|---|---|---|---|---|---|---|---|---|
| AM-001 | P0 | Production security | Remove unsafe DB/Redis/MinIO fallback credentials; require secret injection | DevOps + owner | Credential inventory and deliberate rotation | BLOCKED | Compose source audit found weak defaults; no live environment modified | Owner-managed secret rotation and deployment window |
| AM-002 | P0 | Deployment | Gate production deployment, immutable image IDs, prevent unverified Terraform apply | DevOps | CI acceptance checks | PARTIAL | Workflow source audit; no production run | Review target/account and existing infrastructure state |
| AM-003 | P0 | Security | Complete object-level authorization and tenant-isolation audit/regressions | Security + backend | PostgreSQL integration service | PARTIAL | Guard/service sources reviewed; adversarial DB proof absent | PostgreSQL unavailable in this environment |
| AM-004 | P0 | Secrets | Inventory/rotate credentials found in historical repository objects | Owner + security | Secret-manager access | BLOCKED | No secret values reproduced | Rotation/revocation; history rewrite needs explicit authorization |
| AM-005 | P1 | WhatsApp recovery | Pause credential-auth-failed broadcasts and resume when matching tenant/phone reconnects | WhatsApp | Meta sandbox, durable queue | IMPLEMENTED_UNVERIFIED | Recovery + workflow focused tests 10/10; final backend Jest 34 suites/199 tests passed | Live token revoke/reconnect and Redis/SQL crash-window test |
| AM-006 | P1 | WhatsApp recovery | Make SQL state and Redis scheduling recoverable across process failure | WhatsApp/platform | Outbox/reconciliation design | NOT_STARTED | Current queue scheduling occurs during SQL transaction; no exactly-once claim | Persistent outbox or reconciler and crash injection |
| AM-007 | P1 | WhatsApp provider | Verify Embedded Signup, scopes, phone mapping, token health and callback subscription | WhatsApp | Meta app + business account | BLOCKED | Source audit only | Authorized Meta credentials and public HTTPS callback |
| AM-008 | P1 | Webhooks | Verify signatures, durability, duplicate/out-of-order handling and replay | WhatsApp | Meta test account; PostgreSQL/Redis | PARTIAL | Source contains durable event path; live/fault injection not run | Provider credentials and database service |
| AM-009 | P1 | Campaigns | Validate consent, suppression, template/window eligibility and opt-out during queued campaign | WhatsApp/CRM | DB+queue integration | PARTIAL | Source audit; no production send | Integration test service and Meta sandbox |
| AM-010 | P1 | Inbox | Verify team assignment, collision, media, status window and error states end-to-end | WhatsApp/frontend | API and UI runtime | PARTIAL | Static review only | Browser/provider environment |
| AM-011 | P1 | Billing | Make payment-event and entitlement transitions atomic/idempotent | Billing | Stripe test mode | PARTIAL | Code audit found event marked processed before automation transition | Stripe sandbox keys and regression coverage |
| AM-012 | P1 | CRM | Enforce deal-stage pipeline invariant and transactional contact imports | CRM | PostgreSQL | PARTIAL | Cross-pipeline stage regression passed; contact batch now persists transactionally; targeted CRM suite 8/8 and final backend suite 34/199 passed | PostgreSQL rollback/integration verification; CSV correctness remains |
| AM-013 | P1 | Workflow | Durable event dispatch and functional scheduler execution under replicas | Workflow | Queue/DB runtime | PARTIAL | Source audit found lost-event window and scheduler log-only target | Distributed failure test and product decision for target registry |
| AM-014 | P1 | CI | Run typecheck, lint, integration and builds as explicit CI gates | QA/DevOps | CI service containers | PARTIAL | Added backend/frontend typecheck and lint workflow steps; local checks pass; hosted workflow not run | Invoke PostgreSQL integration suite and verify skip behavior |
| AM-015 | P1 | Commercial onboarding | Carry plan selection through signup/onboarding to actual configured checkout | Product/frontend/billing | Real pricing catalog | PARTIAL | Public pricing now loads active public plans from billing API; private plans are filtered and prices/features are no longer fabricated | Plan choice is not preserved through signup; no verified checkout flow |
| AM-016 | P1 | Marketplace | Provide purchase path before premium install; report actual transactions only | Marketplace/billing | Entitlement/payment API | PARTIAL | Install checks entitlement; UI lacks customer checkout; revenue estimates not transactions | Marketplace payment model/accounting decision |
| AM-017 | P2 | AI | Centralize quota reservation/metering and invalidate cached provider on credential rotation | AI/billing | Usage reservation service | PARTIAL | Static audit found concurrent quota race and cached key/provider issues | Cross-path integration work |
| AM-018 | P2 | Knowledge | Delete tenant-scoped vectors on document/KB removal; accurately report partial indexing | AI/Qdrant | Qdrant service | PARTIAL | Source audit found metadata-only deletion and swallowed chunk failures | Qdrant integration service |
| AM-019 | P2 | Product/admin | Replace static metrics and inert controls with API-backed states or explicit disabled states | Frontend/admin | Relevant APIs | PARTIAL | Source audit found mock/static figures and dead buttons | Route-level browser verification |
| AM-020 | P2 | SRE | Verify encrypted backup/restore, alerting, queue recovery and capacity targets | DevOps/SRE | Target infrastructure access | BLOCKED | Runbook documented; no restore/alert/load evidence | Owner-authorized infrastructure environment |
| AM-021 | P1 | Dependency security | Resolve remaining backend production and development dependency advisories | Backend/DevOps | Compatibility review | PARTIAL | Removed unused Fastify adapter, upgraded Nodemailer, aligned Nest versions; current production audit: backend 12 moderate, 0 high/critical; frontend 0 | Review moderate and dev dependency findings; results can change with registry advisories |
| AM-022 | P1 | Verification/docs | Reconcile full test/build/audit results and update source-of-truth documents | Lead | Current commands complete | IMPLEMENTED_UNVERIFIED | Backend 34 suites/199 tests, typecheck/build passed; frontend 9 files/43 tests, typecheck/build passed; exact evidence in `docs/TEST_RESULTS.md` | PostgreSQL integration, provider/live environment, security and restore evidence remain external |

## Completed this iteration (local, uncommitted)

- Added broadcast resume after a credential reconnect, scoped to tenant and phone number and queued with scheduled delay.
- Added a focused regression spec for matching credentials and empty query result.
- Corrected the existing workflow webhook action test fixture so the runtime policy is passed at the constructor dependency index actually used.
- Applied non-force dependency audit fixes; aligned Nest common/core resolution after the first test run exposed an incompatible internal module version.
- Removed the unused `@nestjs/platform-fastify` dependency and upgraded Nodemailer to address backend production advisories; frontend production audit is zero and backend has no remaining high/critical production findings.
- Fixed WhatsApp media preview content-type handling for Axios header value types.
- Constrained CRM deal-stage lookup to the deal's existing tenant-owned pipeline; focused regression passes and rejected moves never update the deal.
- Made contact bulk import transactional using the existing TypeORM manager; validates custom fields before writes and publishes events only after successful commit.
- Added backend/frontend typecheck and lint steps to CI; local workflow formatting check passed, but GitHub Actions has not run the patch.
- Replaced hardcoded public pricing cards with configured billing plans, loading/error/empty states and real monthly/annual amounts; public plan query now excludes non-public plans. Purchase/plan-selection handoff remains incomplete.
- Replaced hardcoded public pricing cards with configured billing plans, loading/error/empty states and real monthly/annual amounts; public plan query now excludes non-public plans. Purchase/plan-selection handoff remains incomplete.
- Added current audit, module, roadmap, production-readiness, test-results, known-limitations and WhatsApp product-audit documents. Canonical docs remain in lowercase `docs/`.

## Verification discipline

Do not infer final results from in-progress commands. Append the exact command, exit result, counts and limitations to [`docs/TEST_RESULTS.md`](docs/TEST_RESULTS.md). Do not mark P0/P1 tasks verified without runtime evidence. No automated task in this ledger authorizes a production change.
