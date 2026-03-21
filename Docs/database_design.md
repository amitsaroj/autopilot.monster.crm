# Database Design
Project: autopilot.monster.crm  
Database: PostgreSQL 15+  
ORM: TypeORM  
Strategy: Row-level multi-tenancy via tenant_id on every table

---

## 1. Conventions

- All primary keys: `UUID v4`
- All tables include: `id`, `tenant_id`, `created_at`, `updated_at`, `deleted_at` (soft delete)
- Foreign keys use `{entity}_id` naming
- JSON/JSONB for flexible custom fields and config objects
- All indexes include `tenant_id` as leading column (composite)
- Enum values stored as VARCHAR (easier to extend)

---

## 2. Tenant & Auth Tables

### tenants
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| slug | VARCHAR(50) UNIQUE | URL-safe workspace identifier |
| name | VARCHAR(255) | Display name |
| domain | VARCHAR(255) | Custom domain (optional) |
| status | ENUM | ACTIVE, TRIAL, SUSPENDED, DELETED |
| plan_id | UUID FK | Current plan |
| owner_id | UUID FK | Primary admin user |
| settings | JSONB | Workspace settings |
| timezone | VARCHAR(50) | Default: UTC |
| locale | VARCHAR(10) | Default: en-US |
| trial_ends_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| email | VARCHAR(255) | Unique per tenant |
| password_hash | VARCHAR | bcrypt |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| avatar_url | VARCHAR | |
| role_id | UUID FK | |
| status | ENUM | ACTIVE, INACTIVE, INVITED, SUSPENDED |
| mfa_enabled | BOOLEAN | Default: false |
| mfa_secret | VARCHAR | TOTP secret (encrypted) |
| last_login_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### roles
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | NULL = system role |
| name | VARCHAR(100) | |
| slug | VARCHAR(100) | |
| description | TEXT | |
| is_system | BOOLEAN | Cannot be deleted |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### permissions
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| resource | VARCHAR(100) | e.g., 'crm', 'billing' |
| action | VARCHAR(50) | e.g., 'read', 'write', 'delete' |
| description | TEXT | |

### role_permissions
| Column | Type | Notes |
|---|---|---|
| role_id | UUID FK | |
| permission_id | UUID FK | |
| PRIMARY KEY | (role_id, permission_id) | |

### sessions
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| user_id | UUID FK | |
| refresh_token_hash | VARCHAR | bcrypt hashed |
| ip_address | VARCHAR(45) | |
| user_agent | TEXT | |
| expires_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| revoked_at | TIMESTAMP | |

### api_keys
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| user_id | UUID FK | |
| name | VARCHAR(255) | |
| key_prefix | VARCHAR(20) | e.g., 'sk_live_' |
| key_hash | VARCHAR | SHA-256 |
| permissions | TEXT[] | Scoped permissions |
| last_used_at | TIMESTAMP | |
| expires_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

---

## 3. CRM Tables

### contacts
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(30) | |
| mobile | VARCHAR(30) | |
| job_title | VARCHAR(200) | |
| department | VARCHAR(100) | |
| company_id | UUID FK | |
| owner_id | UUID FK → users | |
| status | ENUM | LEAD, PROSPECT, CUSTOMER, CHURNED |
| lead_source | ENUM | WEBSITE, LINKEDIN, REFERRAL, COLD_OUTREACH, EVENT, PARTNER, OTHER |
| tags | TEXT[] | |
| custom_fields | JSONB | |
| do_not_contact | BOOLEAN | Default: false |
| email_opt_out | BOOLEAN | Default: false |
| whatsapp_opt_in | BOOLEAN | Default: false |
| last_contacted_at | TIMESTAMP | |
| linkedin_url | VARCHAR | |
| twitter_handle | VARCHAR | |
| notes | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Indexes:** `(tenant_id, email)`, `(tenant_id, company_id)`, `(tenant_id, owner_id)`, `tsvector` for full-text

### companies
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| domain | VARCHAR(255) | |
| industry | VARCHAR(100) | |
| size_range | ENUM | 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+ |
| annual_revenue_range | ENUM | <$1M, $1M-$10M, $10M-$50M, $50M-$200M, $200M+ |
| country | VARCHAR(100) | |
| city | VARCHAR(100) | |
| address | JSONB | {street, city, state, zip, country} |
| phone | VARCHAR(30) | |
| website | VARCHAR(255) | |
| owner_id | UUID FK → users | |
| tags | TEXT[] | |
| custom_fields | JSONB | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### leads
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(30) | |
| company_name | VARCHAR(255) | |
| job_title | VARCHAR(200) | |
| owner_id | UUID FK → users | |
| status | ENUM | NEW, CONTACTED, QUALIFIED, NURTURING, UNQUALIFIED, CONVERTED |
| priority | ENUM | HIGH, MEDIUM, LOW |
| lead_source | ENUM | |
| score | INTEGER | 0-100 |
| converted_contact_id | UUID FK → contacts | |
| converted_at | TIMESTAMP | |
| custom_fields | JSONB | |
| notes | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### pipelines
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| is_default | BOOLEAN | |
| currency | VARCHAR(3) | ISO 4217, e.g. USD |
| stages | JSONB | Array of stage configs |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### deals
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(500) | |
| value | DECIMAL(15,2) | |
| currency | VARCHAR(3) | |
| pipeline_id | UUID FK | |
| stage_id | UUID | |
| contact_id | UUID FK | |
| company_id | UUID FK | |
| owner_id | UUID FK → users | |
| status | ENUM | OPEN, WON, LOST |
| probability | INTEGER | 0-100 |
| expected_close_date | DATE | |
| actual_close_date | DATE | |
| lost_reason | TEXT | |
| tags | TEXT[] | |
| custom_fields | JSONB | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### activities
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| type | ENUM | CALL, EMAIL, MEETING, NOTE, TASK, WHATSAPP |
| subject | VARCHAR(500) | |
| description | TEXT | |
| contact_id | UUID FK | |
| deal_id | UUID FK | |
| company_id | UUID FK | |
| owner_id | UUID FK → users | |
| occurred_at | TIMESTAMP | |
| duration_minutes | INTEGER | |
| outcome | VARCHAR(200) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### tasks
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| title | VARCHAR(500) | |
| description | TEXT | |
| contact_id | UUID FK | |
| deal_id | UUID FK | |
| assignee_id | UUID FK → users | |
| priority | ENUM | HIGH, MEDIUM, LOW |
| status | ENUM | OPEN, IN_PROGRESS, COMPLETED, CANCELLED |
| due_date | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### notes
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| title | VARCHAR(500) | |
| content | TEXT | |
| contact_id | UUID FK | |
| deal_id | UUID FK | |
| company_id | UUID FK | |
| author_id | UUID FK → users | |
| tags | TEXT[] | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### products
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| description | TEXT | |
| sku | VARCHAR(100) | |
| price | DECIMAL(15,2) | |
| currency | VARCHAR(3) | |
| billing_type | ENUM | ONE_TIME, MONTHLY, ANNUAL |
| category | VARCHAR(100) | |
| status | ENUM | ACTIVE, INACTIVE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### quotes
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| number | VARCHAR(50) | e.g., QT-2024-001 |
| deal_id | UUID FK | |
| contact_id | UUID FK | |
| status | ENUM | DRAFT, SENT, VIEWED, ACCEPTED, DECLINED, EXPIRED |
| line_items | JSONB | Array of {product_id, qty, price, discount} |
| subtotal | DECIMAL(15,2) | |
| discount_amount | DECIMAL(15,2) | |
| tax_amount | DECIMAL(15,2) | |
| total | DECIMAL(15,2) | |
| currency | VARCHAR(3) | |
| valid_until | DATE | |
| notes | TEXT | |
| sent_at | TIMESTAMP | |
| accepted_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## 4. Billing Tables

### plans
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR(100) | e.g., Starter, Professional, Enterprise |
| slug | VARCHAR(100) UNIQUE | |
| description | TEXT | |
| price_monthly | DECIMAL(10,2) | |
| price_annual | DECIMAL(10,2) | |
| currency | VARCHAR(3) | |
| status | ENUM | ACTIVE, ARCHIVED |
| is_public | BOOLEAN | Visible in pricing page |
| sort_order | INTEGER | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### plan_features
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| plan_id | UUID FK | |
| feature_key | VARCHAR(100) | e.g., 'ai_chat', 'voice_calls' |
| enabled | BOOLEAN | |
| config | JSONB | Feature-specific config |

### plan_limits
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| plan_id | UUID FK | |
| metric | VARCHAR(100) | e.g., 'contacts', 'emails_per_month' |
| value | BIGINT | -1 = unlimited |
| period | ENUM | DAILY, MONTHLY, TOTAL |

### subscriptions
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| plan_id | UUID FK | |
| status | ENUM | ACTIVE, TRIAL, PAST_DUE, CANCELLED, EXPIRED |
| billing_cycle | ENUM | MONTHLY, ANNUAL |
| started_at | TIMESTAMP | |
| current_period_start | TIMESTAMP | |
| current_period_end | TIMESTAMP | |
| trial_ends_at | TIMESTAMP | |
| cancelled_at | TIMESTAMP | |
| stripe_subscription_id | VARCHAR | |
| stripe_customer_id | VARCHAR | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### invoices
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| subscription_id | UUID FK | |
| number | VARCHAR(50) UNIQUE | e.g., INV-2024-001 |
| status | ENUM | DRAFT, OPEN, PAID, VOID, UNCOLLECTIBLE |
| subtotal | DECIMAL(12,2) | |
| tax | DECIMAL(12,2) | |
| total | DECIMAL(12,2) | |
| currency | VARCHAR(3) | |
| period_start | TIMESTAMP | |
| period_end | TIMESTAMP | |
| due_date | TIMESTAMP | |
| paid_at | TIMESTAMP | |
| stripe_invoice_id | VARCHAR | |
| pdf_url | VARCHAR | |
| line_items | JSONB | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### payments
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| invoice_id | UUID FK | |
| amount | DECIMAL(12,2) | |
| currency | VARCHAR(3) | |
| status | ENUM | PENDING, SUCCEEDED, FAILED, REFUNDED |
| payment_method | ENUM | CARD, BANK, CREDITS |
| stripe_payment_intent_id | VARCHAR | |
| stripe_charge_id | VARCHAR | |
| failure_reason | TEXT | |
| created_at | TIMESTAMP | |

### usage_records
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| metric | VARCHAR(100) | |
| quantity | BIGINT | |
| period_start | TIMESTAMP | |
| period_end | TIMESTAMP | |
| unit_cost | DECIMAL(10,6) | |
| total_cost | DECIMAL(10,2) | |
| meta | JSONB | |
| created_at | TIMESTAMP | |

---

## 5. Workflow Tables

### workflows
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| description | TEXT | |
| status | ENUM | DRAFT, ACTIVE, INACTIVE |
| trigger_type | VARCHAR(100) | |
| trigger_config | JSONB | |
| steps | JSONB | Array of step objects |
| version | INTEGER | |
| runs | INTEGER | Total execution count |
| failures | INTEGER | Total failure count |
| created_by | UUID FK → users | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### workflow_executions
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| workflow_id | UUID FK | |
| status | ENUM | RUNNING, COMPLETED, FAILED, CANCELLED |
| trigger_data | JSONB | Input that triggered workflow |
| context | JSONB | Runtime variables |
| current_step_id | VARCHAR | |
| error | TEXT | |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

---

## 6. AI Tables

### ai_agents
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| purpose | TEXT | |
| model | VARCHAR(100) | gpt-4o, claude-3-5-sonnet, etc. |
| temperature | DECIMAL(3,2) | 0.00-1.00 |
| max_tokens | INTEGER | |
| system_prompt | TEXT | |
| knowledge_base_ids | UUID[] | |
| channels | TEXT[] | chat, whatsapp, email, voice |
| tools | JSONB | |
| memory_enabled | BOOLEAN | |
| memory_window | INTEGER | Messages to retain |
| fallback_behavior | ENUM | HUMAN_HANDOFF, APOLOGIZE, RETRY |
| status | ENUM | ACTIVE, PAUSED |
| runs | INTEGER | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### ai_conversations
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| agent_id | UUID FK | |
| contact_id | UUID FK | |
| channel | ENUM | CHAT, WHATSAPP, EMAIL, VOICE |
| status | ENUM | ACTIVE, COMPLETED, HANDED_OFF |
| messages | JSONB | Array of {role, content, timestamp} |
| total_tokens | INTEGER | |
| input_tokens | INTEGER | |
| output_tokens | INTEGER | |
| handoff_reason | TEXT | |
| started_at | TIMESTAMP | |
| ended_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

### knowledge_bases
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| description | TEXT | |
| status | ENUM | ACTIVE, INDEXING, ERROR |
| source_type | ENUM | PDF, URL, TEXT, API |
| source_config | JSONB | |
| doc_count | INTEGER | |
| token_count | INTEGER | |
| last_synced_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## 7. Voice Tables

### calls (see LLD section 8.2 for full entity)

### voice_campaigns
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| status | ENUM | DRAFT, RUNNING, PAUSED, COMPLETED |
| from_number | VARCHAR(20) | |
| script | TEXT | IVR/call script |
| contact_list_id | UUID FK | |
| scheduled_at | TIMESTAMP | |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| total_contacts | INTEGER | |
| calls_made | INTEGER | |
| calls_answered | INTEGER | |
| calls_failed | INTEGER | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## 8. WhatsApp Tables

### whatsapp_messages
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| phone_number_id | UUID FK | |
| contact_id | UUID FK | |
| direction | ENUM | INBOUND, OUTBOUND |
| type | ENUM | TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT, TEMPLATE, INTERACTIVE |
| content | JSONB | {text?, media_url?, template?, buttons?} |
| status | ENUM | QUEUED, SENT, DELIVERED, READ, FAILED |
| wa_message_id | VARCHAR | WhatsApp message ID |
| error_code | VARCHAR | |
| error_message | TEXT | |
| sent_at | TIMESTAMP | |
| delivered_at | TIMESTAMP | |
| read_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

### whatsapp_templates
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| category | ENUM | MARKETING, UTILITY, AUTHENTICATION |
| language | VARCHAR(10) | |
| components | JSONB | Header, body, footer, buttons |
| status | ENUM | PENDING, APPROVED, REJECTED |
| wa_template_id | VARCHAR | |
| rejection_reason | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## 9. Admin & Audit Tables

### audit_logs
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| user_id | UUID FK | |
| action | VARCHAR(200) | e.g., 'contact.created' |
| resource_type | VARCHAR(100) | |
| resource_id | UUID | |
| old_values | JSONB | |
| new_values | JSONB | |
| ip_address | VARCHAR(45) | |
| user_agent | TEXT | |
| severity | ENUM | INFO, WARNING, CRITICAL |
| created_at | TIMESTAMP | |

**Note:** audit_logs has NO tenant_id filter in super-admin queries. Indexed: `(created_at DESC)`, `(tenant_id, created_at DESC)`, `(user_id, created_at DESC)`.

### webhooks
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | VARCHAR(255) | |
| url | VARCHAR(500) | |
| secret | VARCHAR | HMAC signing secret |
| events | TEXT[] | Event types to subscribe to |
| status | ENUM | ACTIVE, INACTIVE |
| last_success_at | TIMESTAMP | |
| last_failure_at | TIMESTAMP | |
| failure_count | INTEGER | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## 10. Database Indexes (Critical)

```sql
-- Multi-tenant + common query patterns
CREATE INDEX idx_contacts_tenant_email ON contacts(tenant_id, email);
CREATE INDEX idx_contacts_tenant_owner ON contacts(tenant_id, owner_id);
CREATE INDEX idx_contacts_tenant_company ON contacts(tenant_id, company_id);
CREATE INDEX idx_deals_tenant_pipeline ON deals(tenant_id, pipeline_id);
CREATE INDEX idx_deals_tenant_owner ON deals(tenant_id, owner_id);
CREATE INDEX idx_deals_tenant_status ON deals(tenant_id, status);
CREATE INDEX idx_calls_tenant_contact ON calls(tenant_id, contact_id);
CREATE INDEX idx_usage_records_tenant_metric ON usage_records(tenant_id, metric, period_start);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(tenant_id, workflow_id, status);

-- Full-text search
CREATE INDEX idx_contacts_fts ON contacts USING GIN(
  to_tsvector('english', coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(email,'') || ' ' || coalesce(phone,''))
);
CREATE INDEX idx_companies_fts ON companies USING GIN(
  to_tsvector('english', coalesce(name,'') || ' ' || coalesce(domain,''))
);
CREATE INDEX idx_deals_fts ON deals USING GIN(
  to_tsvector('english', coalesce(name,''))
);
```
