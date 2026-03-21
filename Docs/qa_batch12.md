# QA Batch 12: High Availability & DR
Project: autopilot.monster.crm

---

- [ ] Turn off active Redis container. Ensure NextJS throws Graceful 500 Maintenance Page.
- [ ] Restart Postgres container rapidly mid-transaction. Verify TypeORM correctly rolls back Deal creation wrapper.
- [ ] Execute `Tenant Soft Delete Cleanup` CRON. Ensure old records physically erased from DB space.
- [ ] Trigger Manual Backup Generator via BullMQ. Check MinIO bucket for resultant zipped SQL dump.
