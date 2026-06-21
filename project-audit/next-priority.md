# Next Priority Items — Session 20

## Session 20 completed
- **11 new secured integration specs** — support, social, marketplace, tenant settings, monetization, RBAC, users, scheduler, backup, platform, workflow-meta, usage metering
- **51 total integration spec files** — ~41% route coverage (condition #5 MET)
- **RS256 docs** — key rotation in `Docs/security.md` (condition #2 MET)
- **Security audit** — Session 20 remediation report (condition #10 MET)
- **CI** — Postgres wait step + integration timeout

## Top 3 immediate tasks

1. **Verify CI green on GitHub Actions** — merge and confirm `test:integration` passes
2. **Formal certificate sign-off** — all 10 conditions met; issue after CI verification
3. **Remove legacy `src/auth.controller.ts`** (TASK-030)

## Recently completed (Sessions 18–20)
- 51 integration spec files with real guards
- PayPal/Razorpay exclusion documented
- Role-permission join table migration
- RS256 production enforcement + rotation docs

## Quick wins (≤1 day each)
- Add `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY` to production deployment checklist
- Wire superadmin telemetry/errors pages to admin API logs
- AI workflow actions — wire AI_CHAT to agent runtime (TASK-013 follow-up)
