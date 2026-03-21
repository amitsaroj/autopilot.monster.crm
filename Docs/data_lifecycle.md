# Data Lifecycle Design
Project: autopilot.monster.crm

---

## 1. Overview
The Data Lifecycle module governs how data is created, retained, archived, and permanently destroyed within the platform to maintain compliance (GDPR, SOC2) and manage database size limits.

---

## 2. States of Data

| State | Description | Accessible By |
|---|---|---|
| **Active** | In use, fully queryable. | All authorized users |
| **Soft Deleted** | Marked as deleted (`deleted_at` IS NOT NULL). Removed from normal queries. | Admins (via Recycle Bin) |
| **Archived** | Moved to cold storage (S3/Glacier). Removed from PostgreSQL. | Super Admins (via request) |
| **Hard Deleted** | Permanently scrubbed from all databases and file systems. | None (irreversible) |

---

## 3. Soft Delete Paradigm (The "Recycle Bin")
All core CRM entities (`contacts`, `deals`, `companies`, `tasks`) use TypeORM's `@DeleteDateColumn`. Let's explore the flow:
1. User clicks "Delete Contact".
2. API calls `repo.softDelete()`, which sets `deleted_at = NOW()`.
3. Contact disappears from standard UI lists (because `BaseTenantRepository` applies `WHERE deleted_at IS NULL`).
4. The contact appears in the "Recycle Bin" UI for 30 days. Tenant admins can click "Restore".
5. Emits `crm.contact.deleted` soft-delete event.

---

## 4. Automated Cleanup (Hard Deletion)
A BullMQ repeatable job (`soft_delete_cleanup`) runs nightly at 03:00 UTC.

**Logic:**
```sql
DELETE FROM contacts 
WHERE deleted_at < NOW() - INTERVAL '30 days';
```
*Note: Due to foreign key constraints, deleting a company will cascade delete its deals and contacts if configured that way, or we enforce setting foreign keys to NULL. In our scalable model, we use application-level cascading via background jobs to prevent massive DB lock contentions.*

---

## 5. Tenant Deletion lifecycle
When a Tenant cancels their subscription:
1. Tenant status set to `DELETED`.
2. 30-day grace period begins. Tenant can email support to reactivate.
3. After 30 days, the `tenant_cleanup` worker fires.
4. It iterates over every module, deleting data grouped by `tenantId`.
5. It drops the MinIO buckets/folders: `storage/tenant-{tenant_id}`.
6. Drops Qdrant collections: `tenant_{tenantId}`.
7. Finally, deletes the `tenants` record and `users`.

---

## 6. Audit Logs Retention
Audit logs are immense. They are kept in PostgreSQL for 90 days.
A background job `audit_archive_worker` runs weekly:
1. Selects all audit logs older than 90 days.
2. Streams them to CSV.
3. Uploads CSV to MinIO `system-audit-archives/` (Glacier tier).
4. Deletes rows from PostgreSQL.
