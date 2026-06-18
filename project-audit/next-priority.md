# Next Priority Items — Session 7

1. **Permission-based RBAC** — add `@Permissions('crm:read')` etc. on all routes; wire PermissionGuard
2. **Full baseline migration** — DDL for all 76 entities; disable DB_SYNCHRONIZE in prod compose
3. **Frontend PagePlaceholder batch 4** — 72 routes still stubbed (CRM nested, builder, AI/voice detail)
4. **Admin mock-data replacement** — 22 admin pages with hardcoded arrays
5. **Workflow engine** — remove mockSteps; load steps from DB; real Bull processor
6. **PlanGuard implementation** — real plan feature checks via billing service
7. **Lead scoring** — rule-based 0-100 per crm_design.md §4
8. **RS256 JWT migration** — per Docs/security.md
9. **Webhook E2E tests** — test @Public routes without guard override
10. **Cross-tenant HTTP isolation test** — verify 403/404 on tenant mismatch
11. **Domain verification** — remove mock always-true in tenant.service.ts
12. **Analytics reports CRUD** — complete persistence + frontend
13. **SDK/OAuth app management** — developer portal APIs + UI
14. **Voice sentiment/summaries** — post-call AI analysis
15. **MinIO in CI** — enable import/export E2E
