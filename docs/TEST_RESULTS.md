# Test and verification results

**Snapshot: 2026-10-16.** Results must be interpreted at the exact working-tree state. Initial baselines and current post-change runs are distinguished below.

## Baseline before targeted fixes/dependency alignment

- Backend `npm run typecheck`: passed.
- Backend `npm run lint:check`: exit 0; 277 warnings, no errors.
- Backend full `npm test -- --runInBand`: failed, 31/32 suites passed, 186 passed / 7 failed. All seven failures were caused by the test constructor fixture not supplying the runtime policy at its actual constructor position.
- Frontend `npm run typecheck`: passed.
- Frontend `npm run lint:check`: exit 0; 1,833 warnings, no errors.
- Frontend `npm test -- --run`: passed, 9 files / 43 tests.
- PostgreSQL readiness: failed at localhost:5432; Redis responded `PONG`; no Compose services were running.

## Targeted current evidence

- Pricing repository regression: `backend/npm test -- --runInBand src/modules/pricing/pricing.repository.spec.ts` passed, 1 suite / 1 test; asserts the public catalog query restricts results to active public plans.
- Pricing change checks: frontend `npm run typecheck`, targeted ESLint for the pricing route/service, `npm test -- --run` (9 files / 43 tests), and `npm run build` all passed; backend typecheck and targeted ESLint for pricing repository/spec passed. Final backend `npm test -- --runInBand` passed, 34 suites / 199 tests.

- `backend/npm test -- --runInBand src/modules/whatsapp/whatsapp-broadcast-recovery.service.spec.ts src/modules/workflow/workflow-webhook-action.spec.ts`: **passed**, 2 suites / 10 tests after correcting fixture dependency position and aligning Nest common/core versions.
- The first run after `npm audit fix` failed before tests loaded because resolved `@nestjs/core` 11.2.7 imported `@nestjs/common` 11.1.17 internal SSE module. Updating the declared common range and lock resolution to 11.2.7 corrected the mismatch.
- Backend final tree: typecheck and Nest production build passed; full Jest **34 suites / 199 tests passed**, including pricing visibility, CRM deal-stage and transactional bulk-import regressions. Targeted ESLint for changed CRM files exited 0 with six existing controller `any` warnings. Full backend lint exited 0 with 277 warnings and 0 errors.
- Frontend post-change pipeline `npm run typecheck && npm run lint:check && npm test -- --run && npm run build`: **exit 0**. Typecheck passed after a narrow Axios header value guard; lint exit 0 with 1,833 warnings; Vitest 9 files / 43 tests passed; Next production build rendered all 309 pages and completed successfully.
- CRM contact import focused suite: `npm test -- --runInBand src/modules/crm/contact-merge.service.spec.ts` passed 8/8 tests; backend typecheck/build passed after the transactional import implementation; full backend suite then passed 33 suites / 198 tests.
- CI workflow formatting: Prettier check passed after formatting `.github/workflows/ci.yml`. Ruby YAML parser validation was unavailable; GitHub Actions has not run the local workflow change.

## Security/dependency evidence

- Before lock remediation, `npm audit --omit=dev`: backend 53 total (1 critical, 24 high, 27 moderate, 1 low); frontend 30 total (1 critical, 11 high, 17 moderate, 1 low).
- Current `npm audit --omit=dev`: frontend **0 findings**; backend **12 findings** (0 high/critical, 12 moderate) after removing the unused Fastify adapter and updating Nodemailer. These are time-sensitive registry results and require rerun against final lockfiles. Dev dependency advisories remain possible; no `--force` major migration was applied.
- No `gitleaks`, `trivy` or `semgrep` executable was available in the environment. No formal secret/dependency scanner report or penetration test was produced.

## Not run / blocked

- PostgreSQL-backed integration and migration-on-empty-database suite: blocked because no PostgreSQL service was available.
- Live Meta, Stripe, Shopify, email/SMS, AI-provider or storage integration checks: not run; no authorized credentials/account supplied.
- Browser-wide route and accessibility verification, representative load testing, backup restore, deployment/rollback and production monitoring: not run.
