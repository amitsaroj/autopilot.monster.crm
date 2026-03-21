# Pricing & Billing Notifications (Dunning)
Project: autopilot.monster.crm

---

## 1. Dunning Flow (Failed Payments)

When Stripe emits `invoice.payment_failed`:
- **Day 1:** Attempt 1 fails. System sends "Action Required: Update Payment Method" email. Grace period active.
- **Day 3:** Attempt 2 fails. System sends "Warning: Account Suspension in 4 days" email. In-app banner activated (`status: PAST_DUE`).
- **Day 5:** Attempt 3 fails. Final notice email.
- **Day 7:** Attempt 4 fails. Status → `SUSPENDED`. APIs return `402 Payment Required`.

## 2. Limit Threshold Notifications

To prevent billing shock for metered usage (Voice, AI, WA):
- **50% of Soft Limit:** In-app notification to Admins (`notification_type: billing_warning`).
- **80% of Soft Limit:** Email + In-app warning.
- **100% of Limit:** Hard cutoff or switch to Overage Billing (depending on tenant settings). Email sent.

## 3. Subscription Events
Admin emails are sent for:
- Successful Plan Upgrade (`invoice.paid` with prorated amount).
- Account Downgrade scheduled for end of period.
- Monthly receipt generation (PDF attached).
