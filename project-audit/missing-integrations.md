# Missing Integrations Audit

## Third-Party Integrations

| Integration | Doc Reference | Backend Status | Gap |
|-------------|---------------|----------------|-----|
| Stripe | billing_design | Implemented | Webhook handler exists; payment methods API missing |
| Twilio Voice | voice_engine | Partial | Outbound calls work; status callback doesn't persist; no number provisioning |
| Meta WhatsApp Cloud API | whatsapp_design | Partial | Webhook parser exists; send returns `true` without API call |
| OpenAI | ai_engine | Implemented | Chat, embeddings, RAG |
| Qdrant | ai_engine | Implemented | Vector storage in rag.service |
| MinIO/S3 | infra_design | Partial | Storage module exists |
| Redis/BullMQ | event_bus | Implemented | Queues for workflows |
| Nodemailer/SMTP | — | Implemented | Email module |
| Sentry | FeatureList | Configured | DSN env-based |
| Google OAuth | dev_platform | Partial | Strategy exists |
| Facebook/GitHub/Apple OAuth | auth | Partial | Strategies may exist in auth module |

## Webhooks — Missing or Incomplete

| Webhook | Direction | Status |
|---------|-----------|--------|
| Stripe billing | Inbound | Implemented at `/monetization/webhook` |
| Twilio status | Inbound | Logs only; no DB update |
| Meta WhatsApp | Inbound | Parses but doesn't persist messages |
| Tenant outbound webhooks | Outbound | Entity exists; no delivery system |
| Workflow webhooks | Inbound | Not implemented |

## Queue Workers — Status

| Queue | Processor | Status |
|-------|-----------|--------|
| workflows | workflow.processor.ts | Exists |
| email | — | Verify |
| voice transcription | — | **Missing** |
| whatsapp broadcast | — | **Missing** |
| import/export | — | **Missing** |
| AI indexing | — | Partial in RAG upload |

## External Services Not Wired

- Wallet/Credits billing
- Fine-tuning pipeline (OpenAI)
- Voice sentiment analysis
- Call summarization
- WhatsApp template approval sync
- Marketplace vendor payouts
- SSO (SAML/OIDC) — settings endpoint missing

**Critical integration gaps: 8**
**Stub integrations: 5**
