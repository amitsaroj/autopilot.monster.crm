# Identifier Strategy (UUID vs Auto-Increment)
Project: autopilot.monster.crm

---

## 1. Overview
Choosing the correct Primary Key strategy drastically affects system scale, security, and URL aesthetics. This documents why AutopilotMonster chose its current ID strategy.

---

## 2. The Decision: UUID v4 (Universal Unique Identifier)

Every primary key across the entire database (`id` in `users`, `tenants`, `deals`, `contacts`) is a **UUID v4**.

### 2.1 Why?

**1. Security (Insecure Direct Object Reference - IDOR):**
If a deal had ID `1052`, a malicious user could sequentially guess `1053`, `1054`. While RBAC prevents access, obscure UUIDs (`f47ac10b-58cc-4372-a567-0e02b2c3d479`) drastically reduce the surface area for aggressive automated scanning.

**2. Distributed Generation:**
Auto-incrementing integers require central coordination (the Database) to guarantee uniqueness. UUIDs can be generated safely by the API layer (NestJS), allowing the system to create complex trees of data (Create Company → Create Deal → Create Task) in memory, knowing all IDs in advance, and pushing them to the database in one massive efficient transaction without waiting for returning `INSERT` ids.

**3. Database Merging / Multitenancy / Sharding:**
If we ever need to migrate a Tenant to a dedicated isolated European database cluster for compliance, moving their records won't cause primary key collisions, as every UUID is globally unique across all databases.

---

## 3. Alternative Considered (And Rejected)

**CUID / NanoID:**
While shorter and URL-friendly, they lack native PostgreSQL support. PostgreSQL natively stores UUIDs in an optimized 16-byte binary format rather than a massive 36-character string, meaning they index almost as fast as bigints.

---

## 4. User-Facing Reference Codes

Because UUIDs look terrible when reading them over a phone call ("Hey Bob, my invoice ID is fox-four-seven-alpha..."), specific customer-facing modules generate a separate, sequential human-readable secondary identifier using a DB sequence per tenant.

- **Invoices:** `INV-00142`
- **Quotes:** `QT-5982`

These are strictly string columns with unique constraints (`tenant_id`, `ref_code`) and are separate from the actual relational primary key UUID.
