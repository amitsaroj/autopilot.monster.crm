# Next Priority Items — Session 19

## Session 19 completed
- **18 new secured integration spec files** (~51 tests) across CRM, billing, analytics, AI, voice, WhatsApp, notifications, search, storage, plugins
- **`secured-http-test.helper.ts`** — shared bootstrap for real-guard HTTP tests
- **CI:** `DB_SYNCHRONIZE`, `--forceExit --runInBand` on `test:integration`
- **PayPal/Razorpay exclusion** documented in certificate (condition #6 MET)

## Top 5 immediate tasks

1. **Push integration coverage to ≥40%** — remaining modules: tenant settings, workflows meta, support, social, marketplace
2. **Verify CI integration suite green** on GitHub Actions after merge
3. **Security audit sign-off** — condition #10 verification
4. **RS256 JWT documentation** — complete condition #2 partial
5. **Usage metering HTTP assertion** — contacts_limit increment in secured spec

## Recently completed (Sessions 18–19)
- 40 integration spec files with real guards
- Role-permission join table migration
- Billing provider exclusion sign-off
- Webhook HTTP E2E + auth refresh tests

## Quick wins (≤1 day each)
- Migrate any remaining specs using mock guards to `bootstrapSecuredHttpTest`
- Remove legacy `src/auth.controller.ts` (TASK-030)
- Add `jest --detectOpenHandles` diagnostic in CI if worker leaks persist
