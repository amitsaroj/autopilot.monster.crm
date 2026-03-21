# QA Batch 3: Workflow Engine Reliability
Project: autopilot.monster.crm

---

- [ ] Build workflow trigger `DEAL_WON` -> action `SEND_EMAIL`.
- [ ] Simulate deal win; verify worker picks up job.
- [ ] Mock SendGrid 500 failure; verify exponential retry 5 times.
- [ ] Test Condition Branch (Deal > $5000: Ping Slack, else: Add Task).
- [ ] Pause workflow during execution state via DB. Wait step should hold.
- [ ] Enforce max 25 steps limit on Professional Plan UI builder.
- [ ] Evaluate variables injection (e.g. `{{contact.firstName}}` properly replaced).
