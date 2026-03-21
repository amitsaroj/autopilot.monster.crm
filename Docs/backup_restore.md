# Backup, Disaster Recovery & Export Strategy
Project: autopilot.monster.crm

---

## 1. System-Level Backup (Disaster Recovery)

### 1.1 Database
- **Continuous:** PostgreSQL Write-Ahead Logs (WAL) are streamed to S3 via WAL-G/pgBackRest. Enables Point-in-Time Recovery (PITR) up to the last 5 minutes.
- **Daily Snapshots:** Managed AWS RDS automated snapshots taken daily at 02:00 UTC. Retained for 35 days.

### 1.2 Object Storage
- S3 Buckets / MinIO configured with Object Versioning to prevent accidental physical deletion.
- Cross-region replication enabled for production disaster recovery.

---

## 2. Tenant-Level Backup

Enterprise customers require the ability to backup and restore their specific tenant without rolling back the entire SaaS platform.

### 2.1 Manual Backup Generation
- Tenant admin clicks "Create Backup" in UI.
- API adds job to `backup` BullMQ queue.
- Worker executes isolated SQL: `\COPY (SELECT * FROM contacts WHERE tenant_id = 'X') TO 'contacts.csv'`.
- Exports all tenant tables, compresses into a ZIP file.
- Archives uploaded to `system-backups/` MinIO bucket.
- User notified via Email with a time-limited presigned download link.

### 2.2 Restoration
- Extremely complex due to cascading FKs.
- System drops and replaces all entity records for that tenant. Performed only via Super Admin support ticket verification.

---

## 3. Data Export Module

Allows users to export data to CSV for external use (e.g., Mailchimp, Excel).

### 3.1 Export Architecture
1. User filters list (e.g., Deals won this month), clicks "Export".
2. UI calls `POST /export` with filter params and resource type.
3. API pushes to `export` queue.
4. Worker streams DB results using TypeORM Cursor Pagination.
5. Records transformed to CSV using `fast-csv` stream.
6. Stream piped directly to MinIO (prevents holding large files in memory).
7. Presigned URL generated and `EXPORT_READY` notification sent.
