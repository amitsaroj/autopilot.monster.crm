# Partial Implementations — Super Admin Audit Swarm

**Date:** 2026-06-19  
**Source:** 15 domain audit reports

Features with incomplete wiring: UI without backend, backend without UI, mock data, stubs, or dual API surfaces.

---

## UI Without Backend (Frontend Shells)

| Feature | UI Location | What's Missing | Priority |
|---------|-------------|----------------|----------|
| SSO Settings | `/settings/workspace/sso` | No SAML/OIDC passport strategies or `/auth/sso/*` endpoints | P1 |
| Workflow Visual Builder | `/workflows/builder` | Static mock; no save/load to workflow API | P1 |
| Workflow Templates Gallery | `/workflows/templates` | Static template cards; not installable packs | P2 |
| SuperAdmin Growth Charts | `/superadmin`, `/superadmin/metrics` | `dummyChartData` / `dummySeries` hardcoded | P1 |
| SuperAdmin KPI Trends | `/superadmin` dashboard | Static +12%, +48 badges | P2 |
| Admin AI Models | `/admin/ai/models` | Static UI, no API | P2 |
| Admin AI Analytics | `/admin/ai/analytics` | Static UI, no API | P2 |
| Admin WhatsApp Metrics | Admin metrics page | Mock charts | P2 |
| Marketplace Verification | `/superadmin/marketplace/verification` | UI only, no backend workflow | P2 |
| Marketplace Categories | `/superadmin/marketplace/categories` | UI only, no CRUD API | P2 |
| Contact Form | `/contact` (marketing) | Submit handler is UI-only | P3 |
| Logo/Favicon Upload | `/superadmin/settings` | Upload UI placeholder, no storage API wired | P2 |

---

## Backend Without UI (API-Ready, No Frontend)

| Feature | Backend API | Service File Exists | Priority |
|---------|-------------|---------------------|----------|
| Feature Flags (global + tenant) | `/admin/feature-flags/*` | `admin-feature-flags.service.ts` ✅ | **P0** |
| Pricing Settings | `/admin/pricing-settings` | `admin-pricing.service.ts` ✅ | **P0** |
| Usage Dashboard | `/admin/usage`, `/admin/usage/summary` | `admin-usage.service.ts` ✅ | **P0** |
| Cost Rules | `/admin/cost-rules` | Service exists | P1 |
| Usage Rules | `/admin/usage-rules` | Service exists | P1 |
| Tenant Overrides | `/admin/tenants/:id/overrides` | `admin-tenant-override.service.ts` | P1 |
| Plan Overrides | `/admin/settings/plan-overrides` | Service exists; **not wired to runtime** | P1 |
| User Overrides | `/admin/user-override` | Backend only | P1 |
| Rate Limits | `/admin/rate-limit` | Backend only | P2 |
| IP Whitelist | `/admin/ip-whitelist` | Backend only | P2 |
| Platform Limits | `/admin/limits` | Backend only | P1 |
| Feature Rules | `/admin/settings/feature-rules` | Separate from `@PlanFeature` runtime | P2 |
| Admin Manual Refunds | None (webhook only) | N/A | P1 |
| Inbound Workflow Webhook Trigger | Not implemented | N/A | P1 |
| WhatsApp Phone Numbers | Not implemented | N/A | P1 |

---

## Mock Data / Hardcoded Values (UI Exists, Data Fake)

| Page / Component | Mock Behavior | Should Wire To | Status |
|------------------|---------------|----------------|--------|
| SuperAdmin dashboard charts | `dummyChartData` | Time-series metrics API | ❌ Open |
| SuperAdmin metrics page | `dummySeries` | `/admin/metrics/*` historical | ❌ Open |
| SuperAdmin cluster resources | Hardcoded CPU/memory % | `/admin/health` | ❌ Open |
| Billing upgrade page | Static plan cards | `GET /monetization/plans` | ❌ Open |
| Billing usage page | Static quotas (10000, 1000, 5000) | Plan limits via API | ❌ Open |
| Tenant billing usage limits | Hardcoded quotas | `GET /limits` from plan | ❌ Open |
| Workflow builder | Static node graph | Workflow CRUD API | ❌ Open |
| Workflow templates page | Static gallery | Workflow metadata API | ⚠️ Partial — lists triggers/actions |
| Admin AI models/analytics | Fake metrics | `/analytics/ai`, usage endpoints | ❌ Open |
| Admin WhatsApp metrics | Placeholder charts | `/analytics/whatsapp` | ❌ Open |
| ~~WhatsApp inbox~~ | ~~Mock chats~~ | ~~Conversation API~~ | ✅ Fixed |
| ~~WhatsApp main page~~ | ~~Mock data~~ | ~~Conversation API~~ | ✅ Fixed |
| ~~Analytics subpages~~ | ~~Mock KPIs~~ | ~~Analytics API~~ | ✅ Fixed |
| ~~Voice pages~~ | ~~Mock calls~~ | ~~Voice API~~ | ✅ Fixed |
| ~~AI knowledge base~~ | ~~Static data~~ | ~~KB API~~ | ✅ Fixed |
| ~~AI usage page~~ | ~~15000 tokens stub~~ | ~~usage_records~~ | ✅ Fixed |
| ~~Plugins page~~ | ~~Static array~~ | ~~`/plugins` API~~ | ✅ Fixed |
| ~~CRM leads/new~~ | ~~Static form~~ | ~~Lead API~~ | ✅ Fixed |
| ~~CRM quotes/send~~ | ~~Placeholder~~ | ~~Quote API~~ | ✅ Fixed |

---

## Backend Stubs (Endpoint Exists, Logic Incomplete)

| Endpoint / Service | Stub Behavior | Domain |
|---------------------|---------------|--------|
| `POST /voice/synthesize` | Returns `{ status: 'queued' }` placeholder | Voice |
| `POST /voice/transcribe` | Returns `{ status: 'pending' }` placeholder | Voice |
| `AdminBackupsService.create()` | Returns fake backup record | Infra |
| `AdminRestoreService.restore()` | No actual restore logic | Infra |
| `POST /ai/chat` AI actions in workflow | Returns `SKIPPED` with reason | Workflow |
| `VoiceCampaignService.start()` | Sets RUNNING, no dial enqueue | Voice |
| `AdminPlanOverrideModule` settings | Stored in DB, unread by PricingService | Feature Flags |
| `PlatformController` (pre-fix) | Empty usage/limits/features | Tenant — **Fixed** |
| `GET /crm/leads/:id/convert` (pre-fix) | `{ success: true }` stub | CRM — **Fixed** |
| `GET /crm/dashboard` (pre-fix) | Hardcoded zeros | CRM — **Fixed** |
| `PluginsController` (pre-fix) | Returned `[]` | Marketplace — **Fixed** |
| `RagService.getUsage()` (pre-fix) | Hardcoded 15000 tokens | AI — **Fixed** |

---

## Dual API Surfaces (Confusion Risk)

| Feature | Controller A | Controller B | Recommendation |
|---------|-------------|----------------|----------------|
| Plans CRUD | `/admin/plans` | `/monetization/admin/plans` | Deprecate one |
| Plan features | `/admin/features` | `/monetization/plans/:id/features` | Consolidate |
| Usage (global) | `/admin/usage` | `/monetization/admin/usage` | Frontend now uses `/admin/usage` |
| Stripe webhooks | `/billing/webhook` | `/monetization/webhook` | Single endpoint |
| Tenant overrides | `AdminTenantOverrideController` | Was on `TenantController` | **Fixed** — consolidated |
| Audit logs | `/admin/audit-logs` (platform) | `/logs/audit` (tenant) | **Fixed** — tenant pages use `/logs/audit` |
| AI knowledge bases | `/ai/kb` (legacy) | `/ai/knowledge-bases` (canonical) | Deprecate `/ai/kb` |
| Auth module | `modules/auth/` | `src/auth.service.ts` (legacy) | Remove legacy (TASK-030) |

---

## Partial CRUD (Read Works, Write Missing)

| Feature | Read | Write | Domain |
|---------|------|-------|--------|
| SuperAdmin Tenants | ✅ List + suspend/activate/delete | ❌ Create/edit/detail forms | Super Admin |
| SuperAdmin Users | ✅ List + search | ❌ Invite/create/edit/suspend | Super Admin |
| SuperAdmin Plans | ✅ Read-only cards | ❌ Create/edit/archive | Super Admin |
| SuperAdmin Settings | ✅ System/email/security save | ⚠️ Asset upload, maintenance toggle | Super Admin |
| SuperAdmin Audits | ✅ List with filters | ❌ CSV export | Super Admin |
| Deal Products UI | ✅ Read products on deal | ❌ Add/remove product UI | CRM |
| Lead Convert UI | ✅ Basic convert | ❌ Options (create company/deal) | CRM |
| Contact Merge UI | ✅ Merge endpoint | ⚠️ Raw ID inputs, no picker | CRM |
| Fine-Tuning UI | ✅ Job list/create | ❌ Dataset file upload | AI |
| WhatsApp Flow Builder | ✅ Save/load to CRM flows | ❌ Runtime execution | WhatsApp |
| Premium Plugin Install | ✅ DB install | ❌ Stripe subscription item | Marketplace |

---

## Guards / Permissions Partially Enforced

| Guard / Control | Status | Gap |
|-----------------|--------|-----|
| PermissionGuard | ✅ Default-deny (S15) | 7/107 controllers may lack `@ResourcePermissions` |
| PlanGuard | ✅ Runtime hierarchy fixed | Plan override module not consumed |
| FeatureGuard | ✅ Removed from global chain | Available for explicit use only |
| LimitGuard | ✅ Registered globally | `trackUsage()` not invoked — limits may be stale |
| ActiveTenantGuard | ✅ Blocks suspended tenants | TRIAL expiry not automated |
| `@Permissions` on admin routes | ⚠️ Partial | SUPER_ADMIN + ResourcePermissions on admin modules |
| Integration test guards | ❌ All overridden | False confidence in CI |

---

## Database / Entity Partial Alignment

| Entity / Table | Gap |
|----------------|-----|
| `audit_logs` | Missing `outcome`, `actor`, `actorRole` columns — mapped in response only |
| `feature_flags` table (design doc) | Not implemented — uses `platform_settings` instead (functional) |
| `AdminPlanOverride` | Stored but not read at runtime |
| Agent entity | Missing AI engine fields from design doc |
| WhatsApp conversations | Uses Contact custom fields, no dedicated table |
| Segment membership | Rules stored, not evaluated |

---

## Test Coverage Partial

| Domain | Unit | Integration | E2E | Notes |
|--------|------|-------------|-----|-------|
| Super Admin | ❌ | ❌ | ❌ | Zero coverage |
| Auth | ⚠️ | ⚠️ Excluded from CI | ❌ | Login HTTP test exists |
| Tenant | ✅ 7 tests | ⚠️ | ❌ | Management spec added |
| CRM | ✅ | ✅ | ⚠️ | Strongest coverage |
| AI | ❌ | ✅ 1 file | ❌ | Skips live OpenAI |
| Voice | ❌ | ✅ 4 tests | ❌ | No webhook/gateway tests |
| WhatsApp | ❌ | ✅ 1 file | ❌ | |
| Workflow | ✅ 8 tests | ✅ Extended | ❌ | |
| Billing | ❌ | ⚠️ Signature only | ❌ | |
| Analytics | ✅ forecast | ✅ | ❌ | |
| Marketplace | ❌ | ❌ | ❌ | |
| Feature Flags | ❌ | ❌ | ❌ | Hierarchy untested |
| Security | ✅ permission.guard | ⚠️ Guards mocked | ❌ | |

---

## Summary Counts

| Category | Count |
|----------|-------|
| UI without backend | 12 |
| Backend without UI | 15 |
| Mock data (still open) | 10 |
| Mock data (fixed this audit) | 12 |
| Backend stubs | 8 (3 fixed) |
| Dual API surfaces | 8 (2 fixed) |
| Partial CRUD flows | 11 |

**Highest-impact partial implementations to resolve:** Super Admin CRUD UIs (P0), billing upgrade/usage pages (P1), workflow visual builder (P1), usage metering invocation (P0).
