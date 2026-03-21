# Plugin Pricing & Monetization
Project: autopilot.monster.crm

---

## 1. Marketplace Models

Developers can monetize their AutopilotMonster plugins using three distinct models, fully managed by our Stripe Connect integration.

### 1.1 Model A: Free
- Plugin requires no payment. Tenant installs it with 1 click.
- E.g., The official "Slack Integration".

### 1.2 Model B: Monthly Subscription
- Developer charges a flat fee (e.g., $15/mo) to use the plugin.
- When an admin clicks Install, the plugin's Stripe Price is added to the Tenant's core AutopilotMonster invoice as a new Subscription Item.
- Revenue Split: 80% to Developer, 20% retained by AutopilotMonster platform.

### 1.3 Model C: Usage Based (Bring Your Own Key vs Metered)
- If a developer builds an "SMS verification" plugin, they can emit usage events back to our API.
- The tenant is billed for the overage.
- *Alternatively*, the plugin requires the tenant to paste their own API Key (BYOK) inside the Plugin Config screen, offloading the cost entirely.

---

## 2. Payouts (Stripe Connect)
Developers onboard via Stripe Connect Express.
At the end of every month, AutopilotMonster automatically transfers the 80% share of accrued plugin subscription fees to their connected account.
