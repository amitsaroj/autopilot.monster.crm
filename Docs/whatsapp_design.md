# WhatsApp Module Design
Project: autopilot.monster.crm

---

## 1. Overview

The WhatsApp module integrates with Meta Cloud API (WhatsApp Business Platform) to enable two-way messaging, template-based broadcasts, conversation management, and AI-assisted inbox handling.

---

## 2. Architecture

```
Inbound Message Flow:
Meta sends webhook → POST /whatsapp/webhook
    │
    ▼
Verify signature (X-Hub-Signature-256)
    │
    ▼
Parse message payload → identify contact by phone
    │
    ▼
Create/update whatsapp_messages record
    │
    ▼
Emit WHATSAPP_EVENTS.MESSAGE_RECEIVED
    │
    ├── AI Agent picks up (if enabled for channel)
    ├── Workflow trigger fires (if configured)
    └── Route to inbox conversation

Outbound Message Flow:
API call / Workflow / AI Agent
    │
    ▼
whatsappQueue.add('send', { tenantId, phoneNumberId, to, message })
    │
    ▼
WhatsAppService.send()
    │
    ▼
Meta Cloud API: POST /v18.0/{phone_number_id}/messages
    │
    ▼
Get message ID → update status
    │
    ▼
Webhook fires: sent → delivered → read
```

---

## 3. Message Types Supported

| Type | Description | API Key |
|---|---|---|
| Text | Plain text message | `type: "text"` |
| Template | Pre-approved template | `type: "template"` |
| Image | Image with caption | `type: "image"` |
| Video | Video file | `type: "video"` |
| Audio | Audio recording | `type: "audio"` |
| Document | PDF, Excel, etc | `type: "document"` |
| Interactive | Buttons / Lists | `type: "interactive"` |
| Location | Share a location | `type: "location"` |
| Reaction | React with emoji | `type: "reaction"` |
| Reply | Reply to message | `context.message_id` |

---

## 4. Template System

### 4.1 Template Categories

- **MARKETING**: Promotional content (requires opt-in)
- **UTILITY**: Transactional (order confirmation, invoice, reminder)
- **AUTHENTICATION**: OTP, password reset

### 4.2 Template Components

```json
{
  "name": "deal_won_notification",
  "language": "en_US",
  "category": "UTILITY",
  "components": [
    {
      "type": "header",
      "format": "TEXT",
      "text": "🎉 Deal Won: {{1}}"
    },
    {
      "type": "body",
      "text": "Congratulations {{2}}! Your deal with {{3}} for ${{4}} has been marked as won. Next step: send the onboarding kit."
    },
    {
      "type": "footer",
      "text": "AutopilotMonster CRM"
    },
    {
      "type": "buttons",
      "buttons": [
        { "type": "URL", "text": "View Deal", "url": "https://app.crm.com/deals/{{5}}" }
      ]
    }
  ]
}
```

### 4.3 Template Approval Flow

1. Tenant creates template via API → stored with `status: PENDING`
2. Submit to Meta via Cloud API → get `wa_template_id`
3. Meta reviews (typically 24–48h)
4. Webhook updates status: `APPROVED` or `REJECTED`
5. On approval: tenant can use in broadcasts and workflows

---

## 5. Broadcast Campaigns

### 5.1 Campaign Structure

```typescript
interface WhatsAppBroadcast {
  id: string;
  tenantId: string;
  name: string;
  templateId: string;
  templateVariables: Record<string, string>;
  contactFilter: {
    tags?: string[];
    status?: string[];
    customField?: { key: string; value: string };
  };
  scheduledAt?: Date;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}
```

### 5.2 Broadcast Sending Logic

```
Broadcast triggered
    │
    ▼
Load contacts matching filter (batch 1000 at a time)
    │
    ▼
Check WA opt-in status for each contact
    │
    ▼
For each opted-in contact:
  whatsappQueue.add('send-template', {
    tenantId,
    to: contact.whatsappNumber,
    templateId,
    variables: buildVariables(contact, broadcast),
  }, { 
    delay: index * 100, // 10 messages/second rate limit
    priority: 2 
  })
    │
    ▼
Rate limiting: 80 messages/second per phone number (Meta limit)
    │
    ▼
Update broadcast stats via webhook callbacks
```

---

## 6. Conversation Inbox

The WhatsApp inbox shows all active conversations (24-hour messaging window):

- **Active conversations**: Contacts who sent a message < 24h ago (can reply freely)
- **Template-only**: Contacts silent > 24h (can only send approved templates)
- **Resolved**: Conversation marked done
- **Unassigned**: No agent assigned

### 6.1 Assignment

Conversations can be:
- Auto-assigned to AI agent (if enabled)
- Round-robin to human agents (if queue set up)
- Manually assigned by team lead

---

## 7. WhatsApp Opt-In Management

Contacts have `whatsapp_opt_in: boolean` flag.

Opt-in collection methods:
- Landing page with "Message us on WhatsApp" button
- Form submission with WhatsApp consent checkbox
- Double opt-in: send "Reply YES to receive updates"
- Import: manually set opt-in = true (not recommended)

---

## 8. Webhook Security

Meta webhooks are verified using HMAC SHA-256:

```typescript
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', process.env.WHATSAPP_APP_SECRET);
  const digest = `sha256=${hmac.update(payload).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
```

---

## 9. WhatsApp Limits by Plan

| Plan | Messages/Month | Broadcasts | Templates | AI Chat |
|---|---|---|---|---|
| Starter | 1,000 | 1 | 3 | No |
| Professional | 10,000 | 10 | 20 | Yes (basic) |
| Enterprise | 100,000 | Unlimited | Unlimited | Yes (custom agents) |

---

## 10. WhatsApp Analytics

| Metric | Description |
|---|---|
| Messages sent | All outbound count |
| Delivery rate | Delivered/Sent ratio |
| Read rate | Read/Delivered ratio |
| Response rate | Inbound replies / outbound |
| Avg response time | Time to first agent reply |
| Broadcast performance | Per-campaign stats |
| Opt-out rate | Monthly unsubscribes |
