# CRM Module Design
Project: autopilot.monster.crm

---

## 1. Overview

The CRM module is the core of AutopilotMonster. It manages contacts, leads, companies, deals, pipelines, products, quotes, tasks, activities, and notes. All data is multi-tenant isolated via `tenant_id`.

---

## 2. Feature Set

| Feature | Description |
|---|---|
| Contacts | Full contact lifecycle management |
| Leads | Lead capture, scoring, conversion |
| Companies | B2B company records |
| Pipelines | Custom deal pipelines with stages |
| Deals | Opportunity management |
| Products | Product catalog |
| Quotes | Quote builder with PDF export |
| Tasks | Task assignment and tracking |
| Activities | Call/email/meeting log |
| Notes | Rich text notes on any entity |
| Forecast | Weighted pipeline revenue forecast |
| Custom Fields | Tenant-configurable fields on any entity |
| Import/Export | CSV/Excel bulk operations |
| Full-Text Search | PostgreSQL tsvector search |
| Tags | Multi-value tagging on entities |

---

## 3. Pipeline & Stage Design

A pipeline contains a JSON array of stages:

```json
{
  "id": "pipeline-uuid",
  "name": "Sales Pipeline",
  "stages": [
    { "id": "s1", "name": "Prospecting", "probability": 10, "color": "#6B7280", "position": 1 },
    { "id": "s2", "name": "Qualification", "probability": 30, "color": "#3B82F6", "position": 2 },
    { "id": "s3", "name": "Proposal", "probability": 50, "color": "#EAB308", "position": 3 },
    { "id": "s4", "name": "Negotiation", "probability": 70, "color": "#F97316", "position": 4 },
    { "id": "s5", "name": "Closing", "probability": 85, "color": "#22C55E", "position": 5 }
  ]
}
```

Stage change emits `crm.deal.stage.changed` event → triggers workflows.

---

## 4. Lead Scoring

Score computed from:
- Source quality (referral: +30, website: +20, cold: +5)
- Profile completeness (phone: +10, company: +10, title: +10)
- Engagement (email opened: +5, meeting booked: +20)
- Company size (201-500: +15)
- Activity recency (contacted < 7 days: +20)

Score range: 0–100. Recalculated on every lead update.

---

## 5. Contact Import Logic

```
Upload CSV → Parse columns → Preview (first 10 rows)
→ Map CSV columns to CRM fields
→ Validation (email format, required fields)
→ Duplicate check (match by email within tenant)
→ Batch insert in chunks of 500
→ Return: { imported, failed, duplicates, errors[] }
```

---

## 6. Quote Line Items Structure

```json
{
  "lineItems": [
    {
      "productId": "uuid",
      "name": "Enterprise License",
      "description": "Annual enterprise plan",
      "quantity": 1,
      "unitPrice": 48000,
      "discountPercent": 10,
      "discountAmount": 4800,
      "taxPercent": 0,
      "total": 43200
    }
  ],
  "subtotal": 48000,
  "discountAmount": 4800,
  "taxAmount": 0,
  "total": 43200,
  "currency": "USD"
}
```

---

## 7. Custom Fields

Tenant admins can define custom fields on any entity. Stored in `custom_fields JSONB`.

```json
{
  "form_config": [
    { "key": "linkedin_score", "label": "LinkedIn Score", "type": "number", "required": false },
    { "key": "preferred_language", "label": "Preferred Language", "type": "select", "options": ["en","hi","es"] }
  ]
}
```

Custom fields are validated on write using the tenant's field config.

---

## 8. CRM Events Emitted

| Event | Trigger |
|---|---|
| `crm.contact.created` | Contact created |
| `crm.contact.updated` | Contact updated |
| `crm.deal.created` | Deal created |
| `crm.deal.stage.changed` | Deal moved to new stage |
| `crm.deal.won` | Deal marked Won |
| `crm.deal.lost` | Deal marked Lost |
| `crm.lead.created` | Lead captured |
| `crm.lead.converted` | Lead converted to contact |
| `crm.task.due` | Task past due date (scheduler) |
| `crm.quote.accepted` | Quote accepted by prospect |

All events include: `{ tenantId, entityId, userId, timestamp, payload }`.

---

## 9. API Rate Limits (CRM)

| Endpoint | Rate Limit |
|---|---|
| `GET /crm/*` | 100 req/min per tenant |
| `POST /crm/*` | 60 req/min per tenant |
| `POST /crm/contacts/bulk-import` | 5 req/hour per tenant |
| `GET /crm/*/export` | 10 req/hour per tenant |

---

## 10. Permissions Required

| Action | Required Permission |
|---|---|
| List/view contacts | `crm:read` |
| Create/update contacts | `crm:write` |
| Delete contacts | `crm:delete` |
| View own contacts only | `crm:read:own` |
| Bulk import | `crm:import` |
| Export data | `crm:export` |
| Manage pipelines | `crm:admin` |
