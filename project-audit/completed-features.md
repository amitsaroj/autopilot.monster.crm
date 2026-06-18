# Completed Features

## Session 1
- CRM weighted revenue forecast API (4 endpoints)
- CRM forecast frontend wired to backend
- Voice call list/create/detail/hang-up/recording/transcript APIs
- Twilio status callback persists call state
- API key creation and revocation (`/settings/api-keys`)
- Tenant webhook CRUD and test delivery (`/settings/webhooks`)
- WhatsApp message persistence and conversation APIs
- Meta WhatsApp webhook auth fix
- Workflow activate/deactivate/duplicate/trigger endpoints
- Workflow trigger/action type catalog endpoints
- Analytics overview, CRM, revenue, pipeline, team, voice, WhatsApp endpoints
- Logs module + sub-admin logs
- ForecastService unit test

## Session 2
- Initial TypeORM migration (5 new platform tables + indexes)
- Billing `/billing` controller aligned with api_scope
- Stripe payment methods (setup intent, attach, remove, set default)
- `/ai/agents` CRUD with activate/pause
- `/ai/prompts` CRUD with database persistence
- Voice campaigns entity + full REST API
- WhatsApp templates entity + CRUD + Meta sync
- CRM deal stage/won/lost PATCH endpoints with history events
- CRM contact nested routes (activities, deals, notes, calls, emails, whatsapp)
- DealService unit test

## Session 3
- Full baseline TypeORM migration via `BaselineSchema1739900000001`
- Integration test suite started (auth, tenant isolation, billing webhook)
- `/ai/knowledge-bases` CRUD + sync + document upload/delete
- Quote send/accept/decline/PDF + public view token endpoint
- Billing subscription downgrade/cancel/reactivate
- Voice phone number provisioning APIs (Twilio-backed)
- WhatsApp broadcasts entity + send/schedule APIs
- Marketplace DB-backed directory + install/uninstall
- Company nested routes (contacts, deals, activities)
- Frontend API wiring: voice campaigns, WhatsApp templates, payment methods

## Session 4
- `/ai/conversations` CRUD + messages + handoff (api_scope aligned)
- HTTP E2E suite: health, quote public, deal lifecycle (6 integration tests)
- Public quote view frontend at `/crm/quotes/view/[token]`
- Stripe Elements card attach flow on payment methods page
- WhatsApp broadcast BullMQ processor with 80/sec rate limiting
- Deal products entity + nested CRM routes
- Unified search API (contacts, deals, companies via PostgreSQL)
- CI deploy workflow runs `migrate:prod` before container restart
