# QA Batch 11: Rate Limiting & Protections
Project: autopilot.monster.crm

---

- [ ] Send 350 requests/min via Postman; Ensure 429 Error code trips according to standard window.
- [ ] Send 20 Login attempts for same user (Verify localized brute-force restrict at 5 attempts).
- [ ] Observe `X-RateLimit-Reset` timing header. Send request exactly at reset ms.
- [ ] Mock Webhook burst to 3rd party (Ensure BullMQ outbound limit handles 50 requests/s smoothly).
