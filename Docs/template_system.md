# Template System Architecture
Project: autopilot.monster.crm

---

## 1. Universal Liquid Templates

AutopilotMonster uses **LiquidJS** as a safe, un-evaluable templating language for user-generated templates. This applies to:
- Email Blast Templates
- WhatsApp Broadcasts
- SMS Auto-Responders
- System Prompts for AI Agents

## 2. Context Hydration

When a workflow step triggers a "Send Email" action, it hydrates the template with the current execution context.

```html
<h1>Hello {{ contact.firstName | default: 'there' }}!</h1>
<p>Your deal for {{ deal.value | currency: 'USD' }} has been approved.</p>
```

### 2.1 Supported Filters
The engine includes custom CRM filters:
- `currency: 'USD'` - Formats numbers natively.
- `date_format: 'MM/DD/YYYY'` - Localizes ISO strings.
- `capitalize` - Standard case fixing.
- `fallback` - Replaces missing data seamlessly.

## 3. Multi-Channel Compilation

The same Liquid template object is compiled differently based on the channel.
- **Email:** Compiled down to raw HTML + Inline CSS (via Juice) and passed to Sendgrid.
- **WhatsApp / SMS:** HTML tags are stripped. `<b>bold</b>` is mapped to WhatsApp Markdown `*bold*`. `<br>` becomes `\n`. Passed to Meta API.
