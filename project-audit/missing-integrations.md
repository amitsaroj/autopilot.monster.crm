# Missing Integrations Audit

**Audit date:** 2026-06-18 (Session 10)

## Summary

| Status | Count |
|--------|-------|
| Fully implemented | 8 |
| Partial / stub | 7 |
| Missing | 5 |

## Third-Party Integrations

| Integration | Doc Reference | Status | Gap |
|-------------|---------------|--------|-----|
| Stripe | billing_design | **Implemented** | Webhooks + checkout; payment methods API exists |
| Twilio Voice | voice_engine | **Partial** | Outbound + webhooks; mock creds fallback in dev |
| Meta WhatsApp Cloud API | whatsapp_design | **Partial** | Send + webhook; `mock_secret` fallback |
| OpenAI | ai_engine | **Implemented** | Chat, embeddings, RAG, fine-tuning |
| Qdrant | ai_engine | **Implemented** | Vector storage in rag.service |
| MinIO/S3 | infra_design | **Implemented** | Storage module + presigned URLs |
| Redis/BullMQ | event_bus | **Implemented** | Workflow + WA broadcast processors |
| Nodemailer/SMTP | — | **Implemented** | Email module |
| Sentry | FeatureList | **Configured** | DSN env-based |
| Google OAuth | dev_platform | **Partial** | Strategy exists |
| PayPal | billing_design | **Missing** | Not implemented |
| Razorpay | billing_design | **Missing** | Not implemented |
| SAML/OIDC SSO | security.md | **Missing** | Settings UI only |

## Webhooks

| Webhook | Direction | Status |
|---------|-----------|--------|
| Stripe billing | Inbound | Implemented (`@Public` on billing webhook) |
| Twilio status | Inbound | Implemented — persists to `voice_calls` |
| Meta WhatsApp | Inbound | Implemented — `@Public` on meta-webhook |
| Tenant outbound webhooks | Outbound | Partial — CRUD exists; delivery queue thin |
| Workflow inbound webhooks | Inbound | Missing |

## Queue Workers

| Queue | Processor | Status |
|-------|-----------|--------|
| workflows | `workflow.processor.ts` | Implemented |
| whatsapp-broadcast | `whatsapp-broadcast.processor.ts` | Implemented |
| data-jobs (import/export) | `data-job.processor.ts` | Implemented |
| voice transcription | — | **Missing** |
| AI indexing | Partial | RAG upload triggers indexing |
| email | — | Verify dedicated processor |

## External Services Not Wired

- Voice sentiment analysis (post-call)
- Call summarization (OpenAI)
- WhatsApp template Meta approval sync
- Marketplace vendor payouts
- SDK package publication
- RS256 JWT key pair rotation

**Critical integration gaps: 5 | Partial: 7**
