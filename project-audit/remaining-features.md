# Remaining Features (High Level)

## P0 — Critical
- Import/export/backup job system (scheduler.md)
- Storage presigned URL APIs
- AI SSE streaming chat
- Frontend mock-data replacement (remaining ~20 pages: marketplace, company detail, quotes admin)

## P1 — Important
- Voice sentiment and summaries
- Analytics dashboards/reports CRUD
- Fine-tuning and embedding management APIs
- Wallet/credits billing
- SDK and OAuth app management
- Marketplace plugin config schema validation
- Voice phone number search API (Twilio available numbers)
- Public quote PDF download by token (no auth)

## P2 — Enhancement
- Full-text search indexes via migrations
- Load testing for WhatsApp broadcast rate limits
- Dedicated test Postgres in CI for E2E (currently skips when DB unavailable)
- Quote accept/decline buttons on public view page

## P3 — Quality
- Expand HTTP E2E to auth login + CRM CRUD flows against seeded test DB
- Redis health check fix for local dev (queue module hardcodes `redis` host)
