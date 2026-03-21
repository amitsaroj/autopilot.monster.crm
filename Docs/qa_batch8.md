# QA Batch 8: Limits & Feature Runtime
Project: autopilot.monster.crm

---

- [ ] Toggle `voice_calls` feature flag OFF in Admin. Verify UI hides dialer immediately.
- [ ] Mock `LIMIT_EXCEEDED` exception globally. Ensure core App still loads CRM grid.
- [ ] Apply `tenant_override` for Custom Workflows. Ensure it supersedes Base Plan limit.
- [ ] Redis Outage Simulation: Ensure base API calls skip limits, but exterior metered usage fails closed.
