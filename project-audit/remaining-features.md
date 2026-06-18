# Remaining Features (High Level)

## P0 — Critical
- Frontend mock-data replacement (~10 pages still using placeholders: contact nested routes, admin pages, workflow detail pages)

## P1 — Important
- Analytics reports CRUD (`/analytics/reports` persistence)
- Full-text search indexes via GIN migration
- SDK and OAuth app management
- Marketplace plugin config schema validation
- Voice sentiment and summaries
- MinIO in CI for import/export E2E

## P2 — Enhancement
- Load testing for WhatsApp broadcast rate limits
- Expand HTTP E2E to deal lifecycle + billing flows
- SSO configuration endpoints
- Contact nested route frontend pages (activities, deals, notes per contact)

## P3 — Quality
- Missing user-facing pages: whatsapp flows, settings webhooks dedicated page
- Admin marketplace/voice campaigns frontend wiring
