# CRM domain design

**Source snapshot:** 2026-10-16. Entity decorators, DTOs, migrations, service code and the generated OpenAPI document remain authoritative for exact fields and routes.

## Domain purpose and records

The CRM is the tenant-scoped customer and sales system shared by workspace pages, WhatsApp, workflow automation, analytics and supported integrations. Principal records include contacts, companies, leads, deals, pipelines/stages, products, quotes, tasks, activities, notes, tags, segments and configurable fields. Communication automations should write to these records rather than inventing a separate WhatsApp-only customer database.

## Identity, tenant scope and deduplication

- Business records are tenant-owned. Controllers and services must derive/validate tenant context and query within it; never trust a tenant ID supplied in a body as authorization.
- Contact phone numbers are normalized for lookup and WhatsApp-originated phone contact creation is serialized per tenant and number. Creating a contact from a phone does not grant messaging consent.
- Lead create/import/workflow paths deduplicate on normalized tenant email/phone. When candidate identities resolve ambiguously, the operation fails closed; it does not silently merge or mutate existing leads.
- Idempotent workflow lead creation uses the durable step key so a retry of the same side effect does not create another lead.
- Click-to-WhatsApp referral identifiers are bounded/allowlisted and attached to newly created lead metadata only if Meta supplies them. This metadata is not reliable conversion or revenue attribution.

## Sales lifecycle and pipeline

Leads may be created by CRM users, imports, supported workflow actions or an inbound WhatsApp lead-capture pack. The existing CRM scoring path supplies scores; the WhatsApp pack does not invent a separate score. Deals are associated with pipeline stages; stage transitions can emit events consumed by workflows and analytics. Use the service and DTO validation path for transitions instead of writing stage state directly.

Products and deal-product records support quotes and commercial context. Quotes, payments and invoices are distinct domain/billing concepts; a WhatsApp message containing a payment URL does not constitute a payment operation.

## Customer context and work management

Notes, activities, tasks and tags hold work history and follow-up context. WhatsApp internal notes are CRM notes and are never sent to Meta. Team assignment/notification actions identify an existing workspace user; they do not imply skill, presence, capacity or SLA routing unless the relevant specific capability is implemented.

Segments, contact preferences, locale and custom fields can be used by supported audience/workflow paths. Preferences and imported values do not establish consent. Messaging consent has its own records, evidence, purpose and suppression rules; see [WhatsApp consent](whatsapp-automation-implementation.md#feature-matrix-against-the-master-scope) and [security design](security.md).

## Events and automation integration

CRM lifecycle events are emitted by service operations and may feed the workflow engine, search indexing, analytics and developer webhooks. Event consumers must preserve tenant ownership, use stable/idempotent identities when the producer supplies them, minimize personal/financial data, and prevent self-trigger loops. `LEAD_CREATED` can trigger workflows; causation depth is bounded. Supported event payloads and current consumers are defined in `backend/src/events` and module listeners.

## Imports, exports and data integrity

Imports should validate and preview before writes, report invalid/duplicate rows, preserve explicit field mapping, and never silently grant marketing permission. Bulk writes must enforce tenant scoping and feature/rate limits. Exports require permission, tenant filters, bounded streaming/batching where available, and spreadsheet-formula neutralization for CSV content. Exact limits vary by endpoint; consult DTOs and OpenAPI rather than assuming a global batch size.

## API and authorization

Use the existing `/api/v1` CRM endpoints and generated OpenAPI contract. Requests pass authentication, active-tenant, role/permission, plan/limit and DTO-validation controls as applicable. Use existing CRM services/repositories for writes so events, audit, deduplication, lifecycle transitions and usage controls remain consistent. Do not create a new CRM store for automation-specific data.

## Known boundaries

This document does not assert that every CRM list is server-paginated, every segment evaluates arbitrary criteria, every custom field is available in every workflow trigger, every quote/invoice is integrated with an external payment provider, or every lifecycle event is emitted. Verify the specific route/service implementation before depending on those behaviors.
