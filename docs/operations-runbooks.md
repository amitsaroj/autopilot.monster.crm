# Operations runbooks

These procedures require access to provider consoles and deployment infrastructure. Values belong in a secret manager or protected runtime environment, never in git. The repository's Compose/Terraform/GitHub Actions artifacts are a deployment baseline, not evidence that a production environment is configured.

## 1. Pre-deployment checks

1. Identify the exact release commit and review its migration list.
2. Confirm PostgreSQL backups and a tested restore path; take a pre-migration snapshot/backup.
3. Confirm PostgreSQL, Redis, object storage, Qdrant (when used), API and UI health.
4. Confirm production uses schema synchronization disabled and the supported migration command from the backend package.
5. Inject JWT, database, Redis, storage, provider and webhook secrets through the approved secret mechanism. Do not copy `.env.production` into tickets or commit it.
6. Validate HTTPS URLs, CORS origins, DNS, certificate issuance/renewal, reverse-proxy routing and `/api/v1/health/ready`.
7. Review queue depth, failed jobs and API resource capacity. Current queue consumers share the API process; scale implications differ from a separate worker fleet.
8. Run the current documented backend/frontend typecheck, lint and test commands. Record command, commit and result in the release evidence.

## 2. Migration and release

1. Stop or coordinate writers if the migration is not safe for concurrent requests.
2. Apply migrations using the documented package command and inspect the migration ledger.
3. Deploy API and UI images from the same immutable commit/tag.
4. Check application boot, readiness, database connectivity, Redis queues, storage, error logs and webhook endpoints.
5. Verify a representative authenticated tenant request and confirm that another tenant cannot access its records.
6. If boot, migration or health checks fail, stop traffic or roll back to the last compatible image. Do not reverse a migration or restore a database without assessing writes since deployment.

## 3. Secrets and key rotation

1. Inventory configured secrets by service without printing their values.
2. Rotate the credential in its provider console; record owner, scope and effective time.
3. Update the secret manager/runtime and restart/redeploy the dependent service.
4. Confirm successful authentication, callback signatures, and provider health.
5. Revoke the old credential after validating new usage. For encryption key rotation, retain an approved keyring/decryption path until stored ciphertext has been re-encrypted.
6. Treat any credential found in git history as compromised. Rotation is required even if the current working tree no longer contains it.

## 4. Meta WhatsApp setup and smoke

1. Create/verify the Meta Business and WhatsApp Business assets, phone-number ownership and app permissions required by the Cloud API.
2. Configure application ID/secret, webhook verification/signature settings, API version and encrypted token/keyring variables from `backend/.env.example`.
3. Configure the public HTTPS callback and subscribe the WABA to required message, status and template/account events.
4. Connect the tenant-owned WABA/phone number through the supported account flow; verify the number mapping and capability registry.
5. In a non-production tenant, verify inbound signature acceptance/rejection, duplicate event idempotency, opt-in/out behavior, approved-template status, service-window enforcement, outbound send and delivery-status handling.
6. Verify queue recovery and failed webhook replay; ensure replay is tenant-scoped and raw payloads/secrets are not exposed.
7. Only then enable a production audience, with documented consent evidence and approved content.

Do not use unofficial WhatsApp Web sessions. Do not assume all account regions/providers expose the same interactive, media, read-status or commerce capabilities.

## 5. Shopify setup and smoke

Configure `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_CALLBACK_URL`, `SHOPIFY_WEBHOOK_URL`, approved scopes, API version and a 32-byte encryption key/keyring. The callback and webhook URLs must be publicly reachable over HTTPS.

1. Register the callback/webhook URLs and request only required scopes, including `read_orders` for the current order-status workflow action.
2. Run OAuth against a development store; validate HMAC/state, expiring credential refresh, scope visibility and webhook health.
3. Deliver signed test webhooks and verify duplicate delivery idempotency and payload minimization.
4. Test order lookup only from inbound WhatsApp and verify sender-phone matching. Missing protected phone fields must fail closed.
5. Test disconnect/uninstall and ensure local credentials are revoked/erased only after provider confirmation.

The Shopify cart-recovery catalog product is unavailable. Checkout recovery URLs and personal identifiers are intentionally not retained by the current webhook path.

## 6. Stripe platform billing smoke

1. Configure Stripe secret/public keys, webhook signing secret and actual price identifiers for each enabled plan/product.
2. In test mode, verify checkout creation, signed webhook acceptance, replay/idempotency, subscription lifecycle and entitlement changes.
3. Confirm failed payment does not grant paid installation access; a browser return URL is not an entitlement signal.
4. Verify transactional outbox dispatch/recovery and inspect only redacted delivery metadata.
5. Do not switch to live mode until finance/legal owners approve product/pricing/tax terms and customer-facing fee disclosures.

This Stripe surface is platform billing. It does not imply connected customer payment processing or native WhatsApp payments.

## 7. AI, voice and other providers

- AI: configure provider keys, Qdrant, storage, indexed tenant knowledge and quotas; test grounded answers, fallback/handoff, cost metering and tenant isolation.
- Voice: configure Twilio account/application/phone numbers and callback URLs; test call status, opt-in and failure handling. Optional voice providers require separate credentials.
- SMTP/SMS/social/OAuth: configure per-provider credentials, callback URLs, verified sender/domain and appropriate scopes. A configured code path is not a validated integration.

## 8. Monitoring, queue operations and recovery

Monitor readiness endpoints, database pool/locks, Redis availability and queue depth, failed/delayed jobs, webhook lag, provider rate-limit/errors, disk/object storage, AI usage, billing outboxes, and tenant limits. Alert thresholds and paging integrations must be configured by the operator; they are not supplied by the documentation itself.

For stuck work: identify tenant/resource and correlation/event ID; inspect persisted execution/delivery state; confirm whether the provider accepted the operation before retrying; avoid blind replay of messages/payments; replay only supported failed items through idempotent controls; record manual intervention. Restore tests must confirm database, Redis policy, object storage and encryption keys as a coordinated recovery set.

## 9. Rollback and incident response

1. Stop/limit affected sends or integrations using account/workflow/campaign controls.
2. Preserve correlation IDs, provider IDs, timestamps and redacted status metadata.
3. Revoke compromised provider/API credentials and rotate dependent secrets.
4. Roll back application artifacts only when schema compatibility permits; otherwise use a forward fix or a reviewed restore plan.
5. Identify tenant/data/message scope, document customer impact, and follow legal/security notification procedures.
6. Re-enable traffic only after health, isolation, queue recovery and provider behavior are revalidated.

## 10. Go-live acceptance checklist

- [ ] Release commit, migration plan, backups and tested restore procedure recorded.
- [ ] Production secrets delivered securely; exposed credentials rotated.
- [ ] HTTPS, DNS, CORS, health and alerting verified.
- [ ] Full test/typecheck/build results recorded for the release commit; failures resolved or explicitly accepted by release owner.
- [ ] Tenant/RBAC/API-key boundary checked.
- [ ] Meta account, templates, consent/opt-out, inbound/outbound/status and queue replay smoke passed in the target environment.
- [ ] Shopify/Stripe/AI/voice smoke completed for every enabled feature; disabled capabilities remain clearly unavailable.
- [ ] Usage, pricing, opt-out, retention, privacy and customer support procedures approved.
