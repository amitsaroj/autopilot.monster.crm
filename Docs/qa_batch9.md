# QA Batch 9: Reporting & Analytics
Project: autopilot.monster.crm

---

- [ ] Execute `analytics_materialize` nightly cron manually. Check `revenue_daily` view.
- [ ] View Sales Leaderboard; verify deals owned by deleted users still calculate correctly.
- [ ] Hit Analytics endpoint continuously 50 times (Ensure Route to Aurora Read Replica avoids primary lock).
- [ ] Print "Export as PDF" via Puppeteer headless run.
