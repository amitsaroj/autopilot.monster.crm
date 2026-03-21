# Upgrade Strategy (The Engine)
Project: autopilot.monster.crm

---

## 1. Database Migrations

SaaS platforms must upgrade constantly without downtime.
- **TypeORM Migrations** are executed natively in the CI/CD pipeline immediately before the API Pods are cycled.
- **Rules of Migration:**
  - Never rename a column or drop a column in a single deployment.
  - *Phase 1:* Add new column. Deploy API that writes to both old and new.
  - *Phase 2:* Run background script to backfill old data to new column.
  - *Phase 3:* Point API reads to new column.
  - *Phase 4 (Later deploy):* Drop the old column.

## 2. API Versioning

- We map version numbers to the URL: `/v1/crm/contacts`.
- If a payload contract changes (e.g. changing `phoneNumber` to an object), we create `ContactControllerV2` and map it to `/v2/crm/contacts`.
- V1 continues returning the old structure (mapped internally) for 12 months minimum. We check API keys using deprecated versions and notify Tenant Admins.

## 3. Stateful Worker Upgrades

When upgrading BullMQ Workers:
1. Since Jobs are JSON payloads, if `Worker v2` requires a new field `campaignType` in the payload, `Worker v2` must defensively handle jobs submitted by `API v1` that lack that field.
2. The `api` containers are deployed and cycled *first*, then the `worker` containers are deployed.
