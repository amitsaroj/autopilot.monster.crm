# Missing API Endpoints

**Audit date:** 2026-06-18 (Session 10)  
Compared against `Docs/api_scope.md`. Documented path is canonical.

## Summary

| Category | Documented | Implemented | Missing/Partial |
|----------|------------|-------------|-----------------|
| Auth | 14 | 12 | 2 |
| CRM | 65 | 58 | 7 |
| Workflows | 12 | 12 | 0 |
| AI | 22 | 18 | 4 |
| Voice | 20 | 16 | 4 |
| WhatsApp | 18 | 12 | 6 |
| Billing | 16 | 13 | 3 |
| Analytics | 14 | 12 | 2 |
| Settings | 20 | 14 | 6 |
| Search/Storage | 10 | 8 | 2 |
| Marketplace | 8 | 4 | 4 |
| Import/Export | 8 | 6 | 2 |
| **Total** | **~250** | **~205** | **~45** |

## Still Missing or Incomplete

### Auth
```
DELETE /auth/sessions/:id     — verify single-session revoke
POST   /auth/verify-email     — verify implementation
```

### CRM
```
GET    /crm/contacts/:id/whatsapp   — dedicated WA history (may use messages)
PATCH  /crm/contacts/bulk-update    — verify
DELETE /crm/contacts/bulk-delete    — verify
GET    /crm/leads/export            — verify CSV export
```

### AI
```
POST   /ai/conversations/:id/handoff
GET/POST embedding management APIs
PATCH  /ai/prompts/:id              — verify update endpoint
```

### Voice
```
GET/PATCH /voice/settings
POST   /voice/synthesize            — stub response
POST   /voice/transcribe            — stub response
GET    /voice/transcripts/:id       — verify detail endpoint
```

### WhatsApp
```
GET/POST/DELETE /whatsapp/numbers
POST   /whatsapp/conversations/:id/assign
POST   /whatsapp/conversations/:id/resolve
GET/PATCH /whatsapp/settings
GET    /whatsapp/templates/:id
```

### Billing
```
GET    /billing/invoices/:id/pdf    — verify PDF generation
GET    /billing/usage/history       — verify
PayPal/Razorpay webhooks          — not implemented
```

### Analytics
```
GET    /analytics/activities
GET    /analytics/export          — async job integration
```

### Settings
```
GET/PATCH /settings/profile
POST   /settings/profile/avatar
PATCH  /settings/password
GET/PATCH /settings/notifications
GET/PATCH /settings/workspace
GET/PATCH /settings/sso
GET/POST/DELETE /settings/integrations/*
```

### Marketplace
```
GET    /marketplace/apps/:id
POST   /marketplace/apps/:id/install  — verify real install flow
Vendor payout APIs                    — missing
```

### Logs
```
GET /logs/audit
GET /logs/api
GET /logs/webhooks
```

**Estimated missing endpoints: ~45 of ~250 documented (~82% coverage)**
