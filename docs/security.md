# Security and data protection design

**Source snapshot:** 2026-10-16. This document describes controls visible in the repository and deployment requirements; it is not a penetration-test report, compliance certification, or guarantee against vulnerabilities.

## Trust boundaries

```text
Browser / external caller
  → reverse proxy and CORS boundary
  → NestJS validation, throttling and authorization pipeline
  → tenant-scoped domain services/repositories
  → PostgreSQL / Redis / MinIO / Qdrant
  → signed third-party callbacks and outbound providers
```

Third-party credentials, callback URLs, business-account scopes and webhook keys are deployment secrets. Do not place them in source, public configuration, screenshots, tickets or logs. `.env.example` files contain names/placeholders only.

## Authentication and authorization

- API requests generally use bearer authentication and `x-tenant-id`; the backend validates membership/active-tenant context.
- Global guards cover throttling, authentication, tenant state, roles, resource permissions, plan features and usage limits. Route metadata can refine applicability; inspect the controller for each operation.
- Frontend route gating is navigation convenience only. API authorization is the security boundary.
- Scoped API keys use server-side hash lookup, explicit scope/tenant context, expiration and rate controls where configured. Raw keys are revealed only at creation; list endpoints must not expose key material or hashes.
- OAuth, MFA and social sign-in require correct provider setup and should be separately validated in deployment.

## Tenant isolation and validation

Every externally supplied record identifier must be resolved in the authenticated tenant. Do not accept request-body `tenantId` as authority. DTO validation and unknown-field rejection are trust-boundary controls; avoid untyped controller bodies. Bulk actions must cap payload size and operate only on tenant-owned active records. Duplicate resolution must fail closed when identity is ambiguous.

## Secrets and encryption

Production secrets belong in a deployment secret manager or protected runtime injection. Rotate credentials that may have been exposed, and follow provider procedures so old keys are revoked. WhatsApp and Shopify token encryption keys/keyrings need safe backup and rotation; loss of a key can make encrypted provider credentials unusable. Never return provider tokens in settings/status APIs. Keep generated webhook secrets one-time-visible and store only protected representations where applicable.

## Webhooks and SSRF

- Meta callbacks require provider verification/signature validation; process events idempotently and persist status before asynchronous dispatch where supported.
- Shopify callbacks require HMAC verification of the raw body, delivery identity and durable idempotent event intake.
- Stripe callbacks require signature verification and idempotent state transitions/outbox dispatch.
- Do not trust callback payload IDs without tenant/account mapping and ownership checks.
- Outbound webhook/URL fetch features must reject private/reserved destinations, validate DNS results, pin the checked address where required, and avoid redirects that bypass validation. Keep time/size/content limits.
- Replay endpoints must be tenant-scoped and permission-checked, create traceable attempts, and make request retries idempotent without reprocessing successful deliveries unsafely.

## WhatsApp consent and policy controls

Consent and messaging policy are enforced at send eligibility, not just at CSV import or UI selection. Marketing needs suitable recorded opt-in; opt-outs suppress immediately; a contact preference does not create consent. Use an approved template when the service window/category requires it and only send templates whose provider status is approved. Do not misclassify marketing as utility/authentication. Account capability checks and template/provider errors must be visible. The [WhatsApp guide](../README.md#whatsapp-business-platform-and-automation) documents current media, template, Shopify and analytics limits.

## AI and sensitive data

AI actions must use tenant-owned agent/knowledge resources and only allowed tools. Treat inbound text/media and retrieved documents as untrusted input; prevent prompt injection from authorizing cross-tenant access or privileged actions. Provide fallback/handoff where the implemented AI workflow supports it. Avoid sending sensitive health, financial or authentication data through WhatsApp unless policy, consent, jurisdiction and security requirements have been reviewed.

## Logging, retention and incident response

Use correlation IDs and structured operational logs while redacting bearer tokens, provider credentials, webhook secrets, full payment data and unnecessary message contents. Audit security-sensitive changes, account connection/disconnection, consent changes and replays. Define retention/deletion policy for messages, media, execution records and provider payloads before production launch. In an incident: revoke the provider/API credential, contain affected tenant/account access, preserve non-secret audit evidence, assess exposed data, rotate dependent encryption keys only with a recovery plan, and follow the applicable notification process.

## Residual deployment risks

Repository controls do not demonstrate live secret rotation, TLS correctness, WAF/edge protections, alerting, dependency vulnerability clearance, restore readiness, rate-limit sizing, provider webhook availability, or legal compliance. Run the [operations runbooks](operations-runbooks.md), security review and target-environment validation before production use.
