# Documentation index

**Canonical documentation root:** this lowercase `docs/` directory. The repository previously contained a second, case-distinct `Docs/` tree with duplicated designs, obsolete scorecards and historical agent notes. Those superseded files are removed; this index is the starting point for maintained documentation.

## Product and engineering

| Document | Source of truth for |
|---|---|
| [Root README](../README.md) | Product overview, local setup, routes, WhatsApp product guide, integrations and operational boundaries |
| [Feature catalog](FEATURE_CATALOG.md) | Module inventory and feature-level evidence/dependency classification |
| [Implementation status](implementation-status.md) | Dated verification snapshot, known failures and external dependencies; not a completion percentage |
| [High-level design](HLD.md) | System context, architecture, deployment shape, tenancy and domain boundaries |
| [Low-level design](LLD.md) | API request lifecycle, modules, persistence, queues and implementation conventions |
| [Security design](security.md) | Authentication, authorization, tenant isolation, secrets, webhooks and security limitations |
| [CRM design](crm-design.md) | CRM entities, lead/contact identity, pipeline, activity, events and data lifecycle |
| [Operations runbooks](operations-runbooks.md) | Production-only configuration, provider setup, deployment, health, rollback and recovery checks |
| [WhatsApp implementation checkpoint](whatsapp-automation-implementation.md) | Current WhatsApp API contracts, catalog coverage, behavior, limitations and provider verification notes |

## Specialized documentation

- [Redesign notes](redesign/README.md) describe the visual foundation and implementation scope.
- [Local redesign verification](redesign/local-verification.md) is a dated report of that local browser/runtime pass, not a permanent guarantee.
- Environment variable names and safe defaults are listed in the root, backend, and frontend `.env.example` files. Those examples are authoritative for names; deploy-time values belong in a secret manager.

## Documentation rules

1. Describe what the checked-in code does; label provider configuration, policy review, and runtime dependencies.
2. Do not invent completion percentages, test results, provider validation, or production readiness.
3. Give status and verification notes an `as of` date and distinguish automated checks from live-provider checks.
4. Prefer one canonical home per subject. Link to detailed contracts instead of copying a second stale API table.
5. When behavior changes, update the owner document and this index only if the source-of-truth map changes.
6. Retired documents should be deleted only after unique procedures/evidence are migrated and all in-repository links are repaired.
