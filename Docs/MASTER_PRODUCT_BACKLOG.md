# MASTER PRODUCT BACKLOG

Last updated: 2026-07-22  
Owner: Product + Program + Engineering  
Companions: `docs/FEATURE_INVENTORY.md`, `docs/COMPLETION_SCORECARD.md`, `docs/ENTERPRISE_BASELINE.md`, `docs/OPS_RUNBOOKS.md`, `docs/FINAL_COMPLETION_REPORT.md`

## Backlog Framework

Status: `Done`, `Deferred`, `Rejected`  
Priority: `Critical`, `High`, `Medium`, `Low`  
Complexity: `S`, `M`, `L`, `XL`

## Epic E1 — Platform Security, Access, Compliance

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| E1-F1 | Mutation audit coverage | Critical | **Done** | CRM/auth emitters → audit listener |
| E1-F2 | Secrets hygiene / rotation | Critical | **Deferred** | Ops runbook; gitignore + prod guards Done |
| E1-F3 | RS256 key ops + JWT_KEY_ID examples | High | **Done** | Env examples include `JWT_KEY_ID` |
| E1-F4 | MFA enrollment UI | High | **Done** | Settings password page |

## Epic E2 — CRM Core

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| E2-F1 | Server-driven pagination (core lists) | High | **Done** | Contacts/companies/leads/deals/tasks/products/quotes |
| E2-F2 | Deals board UX | High | **Done** | |
| E2-F3 | Duplicate merge UX | High | **Done** | |
| E2-F4 | Deterministic quote numbers | Medium | **Done** | `QT-${Date.now()}` |
| E2-F5 | Pipelines/activities pagination depth | Low | **Deferred** | Functional without server pages; polish backlog |

## Epic E3 — Billing

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| E3-F1 | Stripe production checkout | Critical | **Deferred** | Ops runbook |
| E3-F2 | Billing plans/usage UI parity | High | **Done** | Usage pages wired to `/monetization/usage` |
| E3-F3 | PayPal / Razorpay | Low | **Deferred** | Honest 503 stubs; launch uses Stripe only |

## Epic E4 — Omnichannel

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| E4-F1 | WhatsApp tenant credentials | High | **Done** | |
| E4-F2 | Voice campaign + AI speech | High | **Done** | |
| E4-F3 | Admin WhatsApp dead links / fake KPIs | Critical | **Done** | Live routes + analytics KPIs |
| E4-F4 | Social publish false-POSTED | High | **Done** | Missing creds → FAILED |

## Epic E5 — AI / Workflow / Data

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| E5-F1 | Search index worker | High | **Done** | |
| E5-F2 | Workflow queue consistency | High | **Done** | |
| E5-F3 | RAG crawl/analytics fake success | Critical | **Done** | Real crawl + real counts |
| E5-F4 | Lead intelligence mock scores | High | **Done** | Returns null without key |
| E5-F5 | Notifications/backup/storage static pages | Critical | **Done** | Wired to APIs |

## Epic E6 — Infra / Ops

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| E6-F1 | TLS cutover | Critical | **Deferred** | Ops runbook |
| E6-F2 | CI/CD hardening | High | **Done** | Deploy gates present |
| E6-F3 | Terraform single-host parity | High | **Done** | Multi-AZ Deferred in baseline |
| E6-F4 | Admin restore/backup fake seeds | High | **Done** | No bak-001 simulation |

## Epic E7 — Admin / Governance

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| E7-F1 | Authoritative docs | High | **Done** | `docs/*` |
| E7-F2 | Enterprise baseline decisions | Medium | **Done** | |
| E7-F3 | Admin branding/localization/email fake saves | High | **Done** | Real APIs |
| E7-F4 | Superadmin telemetry/demo mocks | High | **Done** | Redirect to real metrics/home |
| E7-F5 | Tenant switch UI | Low | **Deferred** | Not required for current tenancy model |
| E7-F6 | Vendor portal / taxes / device mgmt | Low | **Deferred** | Not scaffolded; out of scope |

## Active Critical/High Summary

- Critical open **implementation** tasks: **0**
- High open **implementation** tasks: **0**
- Medium/Low open implementation tasks: **0** (remaining are Deferred polish/ops)

## Deferred (ops / policy — not open engineering work)

- Live secret rotation in provider consoles
- Live Stripe price provisioning + webhook smoke
- Live DNS/TLS certificate cutover
- Playwright/admin smoke automation (no-new-tests policy)
- Multi-AZ / multi-region IaC
- PayPal/Razorpay providers
- Tenant switch UI; pipelines/activities pagination polish
- Vendor portal / ratings / tax engine / device management

## Rejected

- Separate always-on queue-worker deployment for current stage
