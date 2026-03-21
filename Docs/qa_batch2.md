# QA Batch 2: Core CRM (Contacts & Deals)
Project: autopilot.monster.crm

---

- [ ] Create Contact with all core fields.
- [ ] Assign Contact to new Owner.
- [ ] Attempt reading Contact of Tenant A using JWT from Tenant B (Verify `403/404`).
- [ ] Add Custom Field definition to Tenant schema.
- [ ] Create Deal, associate with Contact and Company.
- [ ] Move Deal stage forward (Verify `crm.deal.stage.changed` event).
- [ ] Mark Deal as WON (Verify revenue updates in Analytics view).
- [ ] Bulk import 5,000 via CSV background job (Verify mapped fields).
