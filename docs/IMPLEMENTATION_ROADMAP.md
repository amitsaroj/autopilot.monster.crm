# Implementation roadmap

This is a dependency-ordered backlog, not a claim that the listed work is complete. Current status and evidence live in [TASKS.md](../TASKS.md) and [module status](MODULE_STATUS.md).

1. **Protect production boundaries (P0):** remove credential defaults; make secret/config validation fail closed; stop automatic unverified production apply; use immutable image references and explicit approval.
2. **Close core correctness gaps (P0/P1):** tenant authorization, transactional imports, CRM pipeline invariant, billing event/outbox consistency, reliable workflow dispatch and scheduler execution.
3. **WhatsApp recovery slice (P1):** credential state transition, scoped broadcast pause, scheduled durable resume, queue reconciliation, stop/consent checks and visible audit state; validate with authorized Meta sandbox.
4. **WhatsApp provider lifecycle (P1):** Embedded Signup, phone/WABA mapping, token health/rotation, webhook subscription/signature, account capabilities and disconnection.
5. **WhatsApp customer workflows (P1):** inbox correctness, approved templates, consent-aware campaigns, audience preview, status reconciliation, cost/usage truth and operational replay.
6. **Shared workflow/AI/CRM (P1/P2):** durable triggers, scheduler, tool scoping, quota reservation, vector lifecycle and CRM activity consistency.
7. **Revenue path (P1/P2):** pricing sourced from configured plans, onboarding continuation, marketplace checkout/entitlement, actual transaction data and admin actions backed by APIs.
8. **Release engineering (P1):** lint/typecheck/integration CI, clean-database migrations, immutable builds, health observability, secrets, backup/restore and rollback rehearsal.
9. **Scale and compliance (P2):** representative queue/database/provider load, tenant fairness, data retention, privacy and jurisdiction-specific messaging review.

The implementation is blocked at production readiness until the environment-specific items in the [deployment runbook](operations-runbooks.md) have evidence. Do not treat a source change as a substitute for a provider or restore exercise.
