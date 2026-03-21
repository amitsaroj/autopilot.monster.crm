# Billing & Pricing Design
Project: autopilot.monster.crm

---

## 1. Overview

AutopilotMonster uses a hybrid billing model:
- **Base subscription** (flat monthly/annual fee per plan)
- **Usage-based charges** (per-minute calls, per-1000 AI tokens, per-1000 WhatsApp messages)
- **Enforced limits** (contacts, users, workflows, etc. capped per plan)
- **Feature flags** (module access controlled by plan)

Stripe handles payment processing. Internal billing engine handles plan enforcement.

---

## 2. Plan Structure

### 2.1 Starter Plan
- **Price**: $49/month or $470/year (-20%)
- **Users**: Up to 5
- **Contacts**: 2,500
- **Emails/month**: 5,000
- **AI Messages/month**: 1,000 (GPT-4o-mini only)
- **Call Minutes/month**: 200
- **WhatsApp Messages/month**: 1,000
- **Workflows**: 5 (max 10 steps)
- **Storage**: 5 GB
- **AI Agents**: 1
- **Support**: Email only

### 2.2 Professional Plan
- **Price**: $199/month or $1,910/year (-20%)
- **Users**: Up to 25
- **Contacts**: 25,000
- **Emails/month**: 50,000
- **AI Messages/month**: 10,000 (GPT-4o + mini)
- **Call Minutes/month**: 2,000
- **WhatsApp Messages/month**: 10,000
- **Workflows**: 50 (max 25 steps)
- **Storage**: 25 GB
- **AI Agents**: 5
- **Support**: Priority email + chat

### 2.3 Enterprise Plan
- **Price**: $799/month or $7,670/year (-20%)
- **Users**: Unlimited
- **Contacts**: Unlimited
- **Emails/month**: Unlimited
- **AI Messages/month**: 100,000 (all models)
- **Call Minutes/month**: 10,000
- **WhatsApp Messages/month**: 100,000
- **Workflows**: Unlimited
- **Storage**: 100 GB
- **AI Agents**: Unlimited
- **Support**: Dedicated CSM + SLA

---

## 3. Usage Metering Architecture

Usage is tracked in real-time using Redis counters + async PostgreSQL persistence.

```
API Request → Guard → Service Handler
                           │
                           ▼
                  UsageInterceptor.after()
                           │
                  await pricingService.incrementUsage(
                    tenantId, 
                    'ai_messages', 
                    1
                  );
                           │
                  Redis INCRBY usage:{tenantId}:{metric}:{period} 1
                           │
                  (async) usageQueue.add('record', { tenantId, metric, amount })
                           │
                  PostgreSQL usage_records INSERT
```

### 3.1 Usage Metric Keys

| Metric | Increment Trigger | Unit |
|---|---|---|
| `contacts` | Contact created | per contact |
| `users` | User invited | per user |
| `workflows` | Workflow created | per workflow |
| `ai_messages` | AI LLM call | per message |
| `ai_tokens` | LLM response | per 1000 tokens |
| `call_minutes` | Voice call | per minute |
| `emails` | Email sent | per email |
| `whatsapp_messages` | WA message sent | per message |
| `storage_gb` | File uploaded | per GB |

---

## 4. Limit Enforcement

```typescript
// In LimitGuard:
@Injectable()
export class LimitGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const metric = this.reflector.get('limitMetric', ctx.getHandler());
    if (!metric) return true;

    const { tenant } = ctx.switchToHttp().getRequest();
    const result = await this.pricingService.checkLimit(tenant.id, metric);

    if (!result.allowed) {
      throw new ForbiddenException(`You've reached your ${metric} limit (${result.used}/${result.limit}). Upgrade your plan.`);
    }

    return true;
  }
}

// Usage in controller:
@Post()
@Limit('contacts')  // Decorator
async createContact() { ... }
```

---

## 5. Feature Flag Evaluation

Priority order (highest wins):
1. **Tenant override** (set by super admin): `tenant_feature_overrides`
2. **Plan feature**: `plan_features`
3. **Default**: `false` (deny by default)

Results cached in Redis `feature:{tenantId}:{featureKey}` for 5 minutes.

### 5.1 All Feature Keys

| Key | Description |
|---|---|
| `ai_chat` | AI chat widget |
| `ai_agents` | Custom AI agents |
| `voice_calls` | Voice calling |
| `voice_campaigns` | Outbound call campaigns |
| `whatsapp` | WhatsApp messaging |
| `whatsapp_campaigns` | WhatsApp broadcast |
| `workflow_engine` | Workflow automation |
| `custom_fields` | Custom entity fields |
| `advanced_analytics` | Full analytics dashboards |
| `api_access` | REST API + API keys |
| `webhooks` | Webhook subscriptions |
| `sso` | SAML/OIDC SSO |
| `custom_domain` | White-label domain |
| `marketplace` | App marketplace |
| `plugins` | Plugin system |
| `quote_builder` | Quote generation + PDF |
| `builder` | UI/form builder |
| `backup` | Data backup + restore |
| `export` | Data export |
| `import` | Bulk data import |

---

## 6. Subscription State Machine

```
TRIAL ──────────────────────────────────────────→ CANCELLED
  │                                                   │
  ▼ (trial ends, card added)                         │
ACTIVE ──────────────────────────────────────────────┤
  │                                                   │
  │ (payment fails)                                   │
  ▼                                                   │
PAST_DUE ──────────────────────────────────────────→ │
  │                                                   │
  │ (no payment in 7 days)                            │
  ▼                                                   │
SUSPENDED ──────────────────────────────────────────→│
  │                                                   │
  │ (tenant pays)                                     │
  ▼                                                   │
ACTIVE ◄──────────────────────────────────────────── │
```

---

## 7. Stripe Integration

```typescript
// Stripe events handled by billing webhook:
stripe.checkout.session.completed → create/update subscription
stripe.invoice.payment_succeeded  → mark invoice paid
stripe.invoice.payment_failed     → mark past_due, notify tenant
stripe.customer.subscription.deleted → cancel subscription
stripe.customer.subscription.updated → plan change
```

---

## 8. Invoice Generation

Invoices are generated automatically on:
- Subscription renewal (monthly/annual)
- Plan upgrade/downgrade (prorated)
- Usage overage (end of month)

Invoice PDF generated via `pdfkit` and stored in `system-invoices/` MinIO bucket.

---

## 9. Plan Upgrade/Downgrade Logic

**Upgrade** (e.g., Starter → Professional):
- Immediate effect
- Prorate: charge difference for remaining days
- New limits take effect immediately
- Feature flags updated (cache cleared)

**Downgrade** (e.g., Enterprise → Professional):
- Effective at end of current billing period
- Show warning if current usage exceeds new plan limits
- Block downgrade if contacts > new plan limit (must delete first)

---

## 10. Credits System

Tenants can purchase add-on credits for usage overage:

| Credit Pack | Price | Includes |
|---|---|---|
| AI Add-on | $29/mo | +10,000 AI messages |
| Voice Add-on | $19/mo | +2,000 call minutes |
| WhatsApp Add-on | $15/mo | +5,000 messages |
| Storage Add-on | $10/mo | +50 GB storage |
