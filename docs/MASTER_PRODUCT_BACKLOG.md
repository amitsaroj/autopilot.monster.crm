# MASTER PRODUCT BACKLOG

Last updated: 2026-07-22  
Owner: Product + Program + Engineering  
Source evidence: `Docs/audit/*`, verified build/format gates in this run.

## Backlog Framework

Status values: `Done`, `In Progress`, `Partial`, `Planned`, `Blocked`, `Rejected`  
Priority values: `Critical`, `High`, `Medium`, `Low`  
Complexity values: `S`, `M`, `L`, `XL`

## Epic E1 - Platform Security, Access, and Compliance

### E1-F1 Complete mutation audit coverage
- Story: Instrument CRM write paths with unified audit emitters (create/update/delete/merge/convert).
- Acceptance:
  - All CRM mutations write actor, tenant, entity, action, timestamp.
  - Audit entries queryable via existing admin/sub-admin surfaces.
  - No auth/tenant/RBAC regression.
- Dependencies: `backend/src/modules/logs/*`, CRM services/controllers.
- Priority: Critical
- Status: Done
- Owner: Security + CRM Backend
- Risk: Compliance and incident forensics gap.
- Complexity: M

### E1-F2 Secrets hygiene and key rotation
- Story: Complete secret rotation playbook for previously committed env material and verify runtime injection from secure stores.
- Acceptance:
  - Rotated credentials for impacted providers.
  - No active secrets in tracked files.
  - Rotation runbook validated by ops.
- Dependencies: CI/CD, cloud secret manager, provider consoles.
- Priority: Critical
- Status: Blocked
- Owner: Security + DevOps
- Risk: Credential exposure blast radius.
- Complexity: S
- Notes: Blocked on ops — requires provider console rotation and secret-manager cutover.

### E1-F3 RS256 key operations verification
- Story: Verify production keypair generation, storage, rotation cadence, and failure recovery.
- Acceptance:
  - Keys are loaded from secure environment stores.
  - Rotation does not invalidate active session strategy unexpectedly.
- Dependencies: Auth module, deployment environment.
- Priority: High
- Status: Done
- Owner: Auth + DevOps
- Risk: Authentication disruption.
- Complexity: S
- Notes: Startup contract checks added for key IDs and PEM validity, with rotation-safe verification support for previous public key.

## Epic E2 - CRM Core Reliability and Scale

### E2-F1 Server-driven pagination rollout
- Story: Convert CRM list pages to pass `page/limit/search` and consume paginated responses.
- Acceptance:
  - Contacts, companies, leads, deals, tasks, products, quotes use server pagination.
  - Shared pagination UX with loading/empty/error states.
  - Existing filter behavior preserved.
- Dependencies: existing backend list DTOs and `toPaginatedResult`.
- Priority: High
- Status: Done
- Owner: Frontend CRM
- Risk: Large-tenant latency and memory pressure.
- Complexity: L

### E2-F2 Deals board production UX cleanup
- Story: Remove hardcoded pipeline/deal metrics and enforce live API-driven states.
- Acceptance:
  - Metrics/cards map to backend payloads only.
  - No hardcoded monetary values in production path.
- Dependencies: CRM deal/pipeline APIs.
- Priority: High
- Status: Done
- Owner: Frontend CRM
- Risk: Data trust erosion for sales teams.
- Complexity: S

### E2-F3 Duplicate merge UX completion
- Story: Add frontend merge workflow using existing duplicate detection APIs.
- Acceptance:
  - Operators can inspect candidates and execute merge flows.
  - Conflict decisions are explicit and auditable.
- Dependencies: duplicate controller/service already wired.
- Priority: High
- Status: Done
- Owner: Frontend CRM
- Risk: Data quality drift.
- Complexity: M

## Epic E3 - Revenue, Billing, and Monetization

### E3-F1 Stripe production checkout readiness
- Story: Validate production price IDs and complete runtime smoke for checkout + webhooks.
- Acceptance:
  - Env-based price IDs set for production.
  - Checkout, webhook, wallet posting verified.
- Dependencies: Stripe, deployment config.
- Priority: Critical
- Status: Blocked
- Owner: Billing + DevOps
- Risk: Revenue interruption.
- Complexity: S
- Notes: Blocked on ops — production Stripe keys and price IDs require live provider setup.

### E3-F2 Billing plans/user flow parity
- Story: Keep plans and upgrade routes production-safe and aligned with backend monetization APIs.
- Acceptance:
  - Plans/upgrade pages resolve correctly.
  - Failed payment states and retries are recoverable.
- Dependencies: `frontend/src/app/(app)/billing/*`, billing APIs.
- Priority: High
- Status: Done
- Owner: Frontend Billing
- Risk: Conversion drop.
- Complexity: S
- Notes: Added failed-payment recovery API + billing UI retry path and webhook status alignment for past-due subscriptions.

## Epic E4 - Omnichannel (WhatsApp, Voice, Inbox)

### E4-F1 WhatsApp production credentials and tenancy hardening
- Story: Complete live Meta setup and per-tenant WABA verification with webhook reliability checks.
- Acceptance:
  - Tenant-scoped profiles map to correct WABA credentials.
  - Broadcast/template flows execute without fallback stubs.
- Dependencies: ops credentials and webhook endpoints.
- Priority: High
- Status: Partial
- Owner: WhatsApp + DevOps
- Risk: Messaging failures and tenant leakage risk.
- Complexity: M
- Notes: Tenant-scoped WhatsApp credential resolution and webhook tenant mapping now enforced in code; still ops-dependent for live tenant credential provisioning and webhook endpoint validation.

### E4-F2 Voice campaign execution depth
- Story: Complete campaign dialer lifecycle and close STT/TTS/sentiment stub paths.
- Acceptance:
  - Campaign start enqueues/executes call jobs.
  - Telemetry/status updates visible in UI.
- Dependencies: queue workers, Twilio integration.
- Priority: High
- Status: Partial
- Owner: Voice + Platform
- Risk: Incomplete outbound automation.
- Complexity: M
- Notes: Pause now drains queued jobs, resume re-enqueues only pending contacts, callback outcome counters remain idempotent on first terminal status; STT/TTS/sentiment depth remains.

## Epic E5 - Workflow, Queueing, and AI Platform

### E5-F1 Search indexing worker completion
- Story: Implement deferred search-index processor wiring and reconcile queue producers/consumers.
- Acceptance:
  - Search index jobs are produced and consumed.
  - Failure retry and dead-letter handling verified.
- Dependencies: workflow queues, search module.
- Priority: High
- Status: Done
- Owner: Platform Backend
- Risk: Stale search results.
- Complexity: M

### E5-F2 Workflow queue consistency
- Story: Remove queue package drift and ensure single queue strategy in workflow runtime.
- Acceptance:
  - No unused queue libraries in active execution path.
  - Queue naming and registration consistent across producers/processors.
- Dependencies: workflow module and processor registration.
- Priority: High
- Status: Done
- Owner: Workflow Backend
- Risk: Job loss or silent non-processing.
- Complexity: S

## Epic E6 - Infrastructure, Delivery, and Operations

### E6-F1 TLS cutover and certificate automation
- Story: Complete Let's Encrypt/DNS cutover for production ingress.
- Acceptance:
  - HTTPS termination active with valid cert chain.
  - Renewal automation validated.
- Dependencies: DNS, ingress/nginx, certbot.
- Priority: Critical
- Status: Blocked
- Owner: Infra + DevOps
- Risk: Go-live blocker and trust failure.
- Complexity: S
- Notes: Blocked on ops — DNS and certificate provisioning required.

### E6-F2 CI/CD hardening
- Story: Improve deployment safety checks and staging-to-prod confidence gates.
- Acceptance:
  - Deployment job waits/health checks are enforced.
  - Required production env validations run before release.
- Dependencies: workflow config, deploy scripts.
- Priority: High
- Status: Done
- Owner: DevOps
- Risk: Broken production deployments.
- Complexity: M
- Notes: Added deploy contract validation, terraform validate/plan gate, SSM command completion wait, and readiness polling.

### E6-F3 Terraform parity with target architecture
- Story: Align IaC with documented runtime architecture and remove stubs.
- Acceptance:
  - Provisioning matches active deployment shape.
  - Ownership and drift controls defined.
- Dependencies: infra modules, cloud accounts.
- Priority: High
- Status: Partial
- Owner: Infra
- Risk: Non-repeatable environment provisioning.
- Complexity: XL
- Notes: Added Terraform automation safety (`fmt -check`, `plan -detailed-exitcode`, apply-on-change only) and retained plan-first apply; full target-architecture parity still pending infra design completion.

## Epic E7 - Experience, Governance, and Baseline Alignment

### E7-F1 Authoritative module docs and status reporting
- Story: Keep root documentation aligned to current architecture and delivery status.
- Acceptance:
  - `README.md` reflects active modules and current readiness.
  - `/docs` has authoritative backlog and implementation status.
- Dependencies: audit artifacts, module owners.
- Priority: High
- Status: Done
- Owner: Product + Program
- Risk: Planning/coordination drift.
- Complexity: S

### E7-F2 Enterprise CRM baseline comparison decisions
- Story: Track baseline capabilities as implemented, deferred, or rejected with rationale.
- Acceptance:
  - Baseline matrix includes rationale for rejected/deferred items.
  - Decisions map to roadmap and owners.
- Dependencies: product strategy and architecture constraints.
- Priority: Medium
- Status: In Progress
- Owner: Product
- Risk: Misaligned stakeholder expectations.
- Complexity: M

## Enterprise Baseline Decision Register

### Implemented
- Tenant isolation and scoped auth/RBAC model.
- Core CRM entities and lifecycle APIs.
- Billing plans/checkout pages and Stripe integration surface.
- Omnichannel scaffolding (WhatsApp + voice + inbox).
- Workflow/queue runtime and AI modules.
- CRM mutation audit emitters with actorId threading.
- Server-driven CRM list pagination (app + admin).
- Duplicate merge UI at `/crm/duplicates`.
- WhatsApp inbound keyword flow execution via workflow engine.
- Search-index queue producer/consumer with PostgreSQL FTS indexing.
- Voice campaign dial enqueue with pause gating and callback telemetry.

### Deferred (not rejected)
- Full Playwright/admin smoke automation (explicitly deferred for this run due no-new-tests constraint).
- Deep analytics custom report builder and scheduler depth.
- Voice STT/TTS/sentiment production depth beyond current Twilio + AI gateway path.

### Rejected (current strategy)
- Separate always-on queue-worker deployment for now.
  - Reason: current architecture intentionally runs processors in API process for this stage; revisit post scale thresholds and SLO measurements.

## Active Critical/High Summary
- Critical open/blocked: 3
  - E1-F2 (Blocked — ops), E3-F1 (Blocked — ops), E6-F1 (Blocked — ops)
- High open/partial/planned: 3
  - E4-F1, E4-F2, E6-F3
