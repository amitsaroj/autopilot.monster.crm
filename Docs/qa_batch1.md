# QA Batch 1: User & Authentication Tests
Project: autopilot.monster.crm

---

- [ ] Validate login with email/password (JWT generation).
- [ ] Validate registration of new Tenant + User.
- [ ] Attempt brute-force login (Verify Redis block after 5 fails).
- [ ] Impersonate user as Super Admin (verify Audit log generated).
- [ ] Reset password flow (validate expiring Email Token).
- [ ] Rotate JWT Refresh Token successfully.
- [ ] Force logout all devices (Revoke Refresh Tokens).
- [ ] Invalid JWT formats (Verify `401 Unauthorized`).
- [ ] Enforce MFA prompt on login if tenant requires it.
