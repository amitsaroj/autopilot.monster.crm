# Multi-Tenant Architecture Design
Project: autopilot.monster.crm

---

## 1. Multi-Tenant Strategy
AutopilotMonster uses a **Row-Level Tenancy (Shared Database, Shared Schema)** architecture. Every table that belongs to a tenant has a `tenant_id` column.

This approach offers the best balance of:
- Cost-efficiency (maximizes DB connection pooling)
- Operational simplicity (single schema migration applies to all tenants)
- Aggregated analytics (easy to query metrics across all tenants for admin purposes)

---

## 2. Global vs. Tenant Data

**Global Data (No `tenant_id`):**  
- Super admin users
- Public pricing plans
- Marketplace apps & plugins
- Global feature toggles
- System limits and metrics

**Tenant Data (Has `tenant_id`):**  
- Users, Roles, Permissions
- Contacts, Leads, Companies, Deals, Activities
- Workflows, AI Agents, Conversations
- Invoices, Subscriptions, Usage records

---

## 3. Security & Isolation

Tenant isolation is strictly enforced at multiple levels to prevent data leaks.

### 3.1 HTTP Header Context
Every request must include `x-tenant-id` (unless it's a global admin route).
If logged in, the `tenantId` is also embedded in the JWT payload.

### 3.2 Tenant Guard Middleware
The `TenantGuard` executes on every request:
1. Extracts `tenantId` from JWT/headers.
2. Looks up the tenant in the `tenants` table.
3. Checks if `status === 'ACTIVE'`.
4. Attaches the `tenant` object to the Express `req` for downstream use.

### 3.3 Base Tenant Repository
All repositories extend `BaseTenantRepository`, which enforces the `tenant_id` filter on every database query. Developers *cannot* execute a query without passing the `tenantId`.

```typescript
export class BaseTenantRepository<T> {
  async findAll(tenantId: string): Promise<T[]> {
    return this.repository.find({ where: { tenantId } });
  }

  async findById(tenantId: string, id: string): Promise<T | null> {
    return this.repository.findOne({ where: { tenantId, id } });
  }

  async save(tenantId: string, entity: Partial<T>): Promise<T> {
    return this.repository.save({ ...entity, tenantId });
  }
}
```

---

## 4. Tenant Lifecycle

### 4.1 Creation (Onboarding)
1. User signs up → creates User and Tenant.
2. Tenant placed in `TRIAL` status with 14-day trial flag.
3. Default Roles generated (Admin, Sales, Support).
4. Default Pipelines generated.
5. Default Workspace settings initialized.

### 4.2 Suspension
If a tenant fails to pay, or is manually flagged by a Super Admin:
1. `status` becomes `SUSPENDED`.
2. All active API tokens are revoked.
3. `TenantGuard` blocks all incoming requests with `403 Forbidden`.
4. Background jobs (workflows, campaigns) are paused.

### 4.3 Soft Deletion
1. When canceled, `status` becomes `DELETED` and `deleted_at` is set.
2. Data is retained for 30 days (Data Retention Policy).
3. After 30 days, a cleanup worker hard-deletes the tenant and cascades all associated data.

---

## 5. Caching & Queue Isolation

**Redis Cache:** All cache keys are prefixed with the tenant ID to prevent collisions.
- Example: `cache:tenant_id:contacts_list_page_1`

**BullMQ Queues:** Jobs from all tenants share the same queues, but the payload always includes `tenantId`. Processors use this `tenantId` to load isolated context.

---

## 6. Tenant File Storage
All uploaded files (avatars, documents, exports) stored in MinIO are physically segregated by directory/bucket per tenant.
- Path format: `storage/tenant-{tenant_id}/files/{uuid}.pdf`
- Presigned URLs are generated ensuring tenants can only download their own files.
