# Operations Runbooks

These runbooks cover production actions that cannot be completed from application code alone. Code-side guardrails are already in place.

## E1-F2 — Secrets hygiene and key rotation

### Goal
Rotate any credentials that may have been exposed historically and inject secrets only from a secure store at runtime.

### Prerequisites
- Access to GitHub repo settings / cloud secret manager
- Provider consoles (OpenAI, Stripe, Twilio, Meta, SMTP)

### Steps
1. Inventory secrets referenced by `backend/.env.production.example` and `frontend/.env.production.example`.
2. Rotate each live credential in the provider console.
3. Store rotated values in the production secret manager / CI secrets (never in git).
4. Confirm tracked files contain only `*.example` templates (`git ls-files | grep env`).
5. Redeploy and verify `/api/v1/health/ready`.

### Code guardrails already shipped
- Production JWT requires valid RS256 PEM material and key IDs.
- Production rejects placeholder Stripe secrets and mock Twilio credentials.
- Production requires HTTPS `APP_URL` / `FRONTEND_URL`.

## E3-F1 — Stripe production checkout readiness

### Goal
Enable paid checkout with real Stripe price IDs and verified webhooks.

### Steps
1. Create Stripe products/prices for Starter/Pro/Enterprise (monthly + annual).
2. Set env:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER_MONTHLY` / `_ANNUAL`
   - `STRIPE_PRICE_PRO_MONTHLY` / `_ANNUAL`
   - `STRIPE_PRICE_ENTERPRISE_MONTHLY` / `_ANNUAL`
3. Point Stripe webhook to `https://<domain>/api/v1/billing/webhook`.
4. Re-seed or update plan price IDs.
5. Smoke: checkout → webhook → subscription active → wallet/invoice surfaces.

## E6-F1 — TLS cutover

### Goal
Terminate HTTPS with a valid certificate on nginx for the compose host.

### Steps
1. Point DNS A/AAAA for the app domain to the Elastic IP from Terraform output.
2. Ensure `docker-compose.prod.yml` nginx + certbot volumes are mounted.
3. Issue cert (`certbot` / ACME webroot path already prepared in nginx config).
4. Confirm `curl -sf https://<domain>/api/v1/health/ready`.
5. Validate renewal timer/cron.

## Live provider validation (WhatsApp / Voice)

### WhatsApp
1. Configure per-tenant Meta WABA credentials in tenant settings.
2. Map `phone_number_id` → tenant.
3. Verify inbound webhook + outbound template/send.

### Voice
1. Configure Twilio account SID/token and from-number.
2. Configure OpenAI key for STT/TTS/sentiment (`VoiceAiService`).
3. Optional: `ELEVENLABS_API_KEY` for voice cloning.
4. Run campaign start/pause/resume and confirm counters.
