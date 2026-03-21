# QA Batch 10: Security & Access Control
Project: autopilot.monster.crm

---

- [ ] Try IDOR: Access User ID of Tenant A while logged in as Tenant B (Ensure 404).
- [ ] XSS validation: Insert `<script>alert(1)</script>` into Deal Name. Ensure UI sanitizes output.
- [ ] Ensure DB Password hashes use Bcrypt w/ Salt Rounds > 10.
- [ ] Validate CORS headers restrict API access strict domains ONLY.
- [ ] Test API Key scopes restrict access exactly to the defined `permissions` array.
