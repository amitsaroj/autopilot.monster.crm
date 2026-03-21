# QA Batch 7: Billing & Metering
Project: autopilot.monster.crm

---

- [ ] Exhaust 1,000 AI Token soft limit (Verify overage calculated correctly in UI).
- [ ] Send Voice campaign; Validate `call_minutes` Redis increment exactly matches Twilio duration.
- [ ] Attempt adding 6th User to Starter Plan (Expect 402 HTTP Response).
- [ ] Upgrade Base Plan to Pro (Verify Stripe prorates accurately).
- [ ] Simulate Stripe `charge.failed` Event (Verify UI drops to PAST_DUE).
