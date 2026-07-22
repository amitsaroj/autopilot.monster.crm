# MASTER BACKLOG — Autopilot Monster CRM

**Audit date:** 2026-07-22 (Agent 15 post Wave 4)  
**Inventory:** 0 ✅ · 59 🟡 · 3 🔴 · 0 ⚫  
**Canonical copy:** this file · Root mirror: `../MASTER_BACKLOG.md`

---

## Critical — remaining after Waves 1–4

| ID | Feature | Problem | Status | Owner | Effort |
|----|---------|---------|--------|-------|--------|
| BL-C01 | F-049 Audit | CRM mutations not audited; only auth/tenant/RBAC in listener | 🟡 Open | Security | M |
| BL-C02 | F-056 Prod TLS | LE cutover + GHCR image supply; self-signed until ops | 🟡 Residual | Infra/Ops | S |
| BL-C03 | F-059 Secrets | Index untrack staged; **git history** still has old env; rotate if real | 🟡 Residual | Security/Ops | S |
| BL-C08 | F-052 Queues | Processors registered; search-index DEFERRED; billing producers open | 🟡 Partial | Workflow/Platform | M |
| BL-C09 | F-031 Stripe | Code uses env prices; **prod env IDs** + smoke checkout not verified | 🟡 Ops | Billing/Ops | S |
| BL-C10 | F-054 FE tests | Vitest 5/5 + CI wired; Playwright + admin smoke open | 🟡 Partial | Frontend QA | L |
| BL-C11 | F-007 RBAC FE | `admin/rbac/page.tsx` hardcoded stats | 🟡 Open | Frontend | S |
| BL-C12 | F-001 RS256 | Code enforces; deploy key material not verified | 🟡 Ops | Auth/Ops | S |

### Critical — closed or downgraded (Waves 1–4)

| ID | Resolution |
|----|------------|
| BL-C04 | Dashboard wired to analytics APIs (F-021 → 🟡) |
| BL-C05 | Inbox wired; omnichannel + WA (F-022 → 🟡) |
| BL-C06 | User groups route fixed (F-009 → 🟡) |
| BL-C07 | Admin fetch migrated to axios (F-047 improved) |
| BL-H06 | DeveloperModule mounted (F-046 → 🟡) |
| BL-M04 | Marketplace templates wired (F-035 → 🟡) |
| BL-M05 | Legacy auth removed (F-004 → 🟡) |
| BL-M11 | AI hub live KPIs (F-029 → 🟡) |

---

## High — remaining

| ID | Feature | Problem | Status | Owner | Effort |
|----|---------|---------|--------|-------|--------|
| BL-H01 | F-062 Pagination | BE opt-in only; FE lists full-array | 🔴 Open | Frontend | L |
| BL-H02 | F-010–017 DTOs | Core CRM validated; AI agents/flows still `any` | 🟡 Residual | CRM/AI | S |
| BL-H03 | F-037/F-041 Hubs | Wired — runtime E2E pending | 🟡 Verify | Frontend QA | S |
| BL-H04 | F-023/024 WhatsApp | Live Meta creds; per-tenant WABA; flow executor | 🟡 Open | WhatsApp/Ops | M |
| BL-H05 | F-025 Voice | Campaign dialer; STT/TTS/sentiment stubs | 🟡 Open | Voice | M |
| BL-H07 | F-020 Duplicates | API wired; **no FE** merge UI | 🟡 Residual | Frontend CRM | M |
| BL-H08 | F-030 Workflow | `@nestjs/bullmq` dep unused | 🟡 Residual | Workflow | S |
| BL-H09 | F-058 CI/CD | Playwright absent; SSM deploy no wait | 🟡 Open | Infra | M |
| BL-H10 | F-057 Terraform | EC2 stub vs README Fargate/RDS | 🟡 Open | Infra | XL |
| BL-H11 | F-050 Email | SMTP documented; prod relay not verified | 🟡 Residual | Infra/Ops | S |
| BL-H12 | F-013 Deals UX | New Deal button / pipeline $ hardcoded | 🟡 Open | Frontend CRM | S |
| BL-H13 | F-036 Search index | Processor DEFERRED; Qdrant wiring | 🟡 Open | Platform | M |
| BL-H14 | F-033/F-061 | Dead nav: `/billing/plans`, `/settings/data`, admin WA | 🔴/🟡 | Frontend | S |

---

## Medium

| ID | Feature | Problem | Owner | Effort |
|----|---------|---------|-------|--------|
| BL-M01 | F-032 Alt pay | PayPal/Razorpay 503 only | Billing | L |
| BL-M02 | F-028 Prompts | PromptTemplateController wired; FE depth thin | AI | S |
| BL-M03 | F-039 Analytics | Custom report builder / scheduled reports stub | Analytics | M |
| BL-M06 | F-027 RAG | Crawl stubs | AI | M |
| BL-M07 | F-047 Admin tests | Thin dedicated admin tests | Backend QA | L |
| BL-M08 | — | Dual toast; unused React Query | Frontend | S |
| BL-M09 | — | FE Dockerfile not standalone | Infra | S |
| BL-M10 | F-048 Sub-admin | Uneven FE wiring | Admin | M |
| BL-M12 | F-035/F-046 FE | No templates UI; dual developer settings surface | Platform/FE | M |

---

## Low

| ID | Feature | Problem | Owner |
|----|---------|---------|-------|
| BL-L01 | F-060 Docs | HLD/LLD obsolete layout | Docs |
| BL-L02 | F-044 Social | Cron depth uneven | Social |
| BL-L03 | F-043 Support | Basic tickets/KB | Support |
| BL-L04 | F-053 Marketing | Static site QA | Frontend |
| BL-L05 | — | Orphan compiled files under backend/src | Backend |

---

## Suggested next waves

1. **Frontend QA** — Playwright baseline + admin smoke (BL-C10 remainder)  
2. **Security follow-up** — BL-C01 CRM audit emitters + BL-C03 secret rotation commit  
3. **Frontend scale** — BL-H01 pagination FE + BL-H07 duplicate merge UI + F-033/F-061  
4. **Ops** — BL-C02 LE certs, BL-C09 Stripe prod IDs, BL-H04 Meta WABA  
5. **Platform FE** — Marketplace templates UI + unify developer vs settings APIs  
6. **Depth** — Search-index → Qdrant, voice campaign dialer, custom analytics reports  

---

## Effort summary (remaining Critical + High)

| Band | Open items | Est. |
|------|----------:|------|
| Critical | 8 (5 partial) | ~2–3 weeks |
| High | 13 | ~3–5 weeks |
| Medium | 9 | ~2–3 weeks |

**Not production ready.** Zero ✅ features under strict DoD. Zero ⚫ broken features.
