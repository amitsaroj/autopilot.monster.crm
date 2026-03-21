# Pricing Model Design
Project: autopilot.monster.crm

---

## 1. Hybrid Pricing Strategy
AutopilotMonster uses a combination of **Flat-rate subscriptions** (Base Plans) and **Usage-based metered billing** (Pay-as-you-go).

---

## 2. Base Subscription Plans

| Plan | Price (Monthly) | Price (Annual) | Description |
|---|---|---|---|
| **Starter** | $49/mo | $470/yr | For solo founders and very small teams. |
| **Professional**| $199/mo | $1,910/yr | For growing sales teams needing automation. |
| **Enterprise** | $799/mo | $7,670/yr | For large organizations with custom needs. |

*Note: All plans are billed in advance (beginning of billing cycle).*

---

## 3. Usage-Based Metering (Overage)

Every base plan includes an allotment of usage. If a tenant exceeds their allotment, they are billed for overages at the end of the month via Stripe Metered Billing.

### 3.1 Metered Prices

| Resource | Unit | Price per Unit | Strategy |
|---|---|---|---|
| AI Messages | 1,000 requests | $0.05 | Tracked per LLM inference call. |
| Voice Calls | 1 Minute | $0.02 | Rounded up to nearest minute. |
| Call Transcripts| 1 Minute | $0.01 | Billed for transcription duration. |
| WA Messages | 1 Message | $0.015 | Meta's native cost + standard markup. |
| Emails | 1,000 sent | $0.50 | Only applies above plan free tier. |
| Storage | 1 GB/month | $0.50 | Peak storage calculated daily. |

### 3.2 Add-on Credit Packs
To avoid unpredictable metered bills, users can buy prepaid "Credits" that automatically apply against usage before metered billing is triggered.
- $10 = 1,000 Custom Credits
- Expiration: Never expire.

---

## 4. Multi-Region Pricing Adjustments
To support global SaaS deployment, pricing supports Geo-adjustments using Stripe's multi-currency features:
- NA / Europe: Standard USD/EUR pricing.
- LATAM / India / SEA: 30% Purchasing Power Parity (PPP) discount automatically applied using Stripe Promo Codes on checkout.

---

## 5. Proration Logic
- **Upgrades:** Prorated immediately. User pays the difference for remaining days in the cycle.
- **Downgrades:** Takes effect at the *end* of the current billing cycle. No refunds issued.
- **Add User Seats:** Billed instantly for prorated amount unilt next cycle.
