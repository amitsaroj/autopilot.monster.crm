# Voice Engine Design
Project: autopilot.monster.crm

---

## 1. Overview

The voice engine enables outbound calling, inbound call handling, IVR, call recording, AI transcription, and call campaigns. Built on Twilio Programmable Voice + WebRTC.

---

## 2. Architecture

```
Outbound Call Flow:
User clicks "Call" in UI
    │
    ▼
POST /voice/calls → VoiceService.initiateCall()
    │
    ▼
TwilioClient.calls.create({
  to: contact.phone,
  from: tenant.twilioNumber,
  url: 'https://api.crm.com/voice/twiml/outbound',  // TwiML instructions
  statusCallback: 'https://api.crm.com/voice/webhook',
  record: true,
  recordingStatusCallback: 'https://api.crm.com/voice/recording/webhook'
})
    │
    ▼
Twilio dials → connect → call starts
    │
    ▼
Twilio webhook fires every status change:
  initiated → ringing → in-progress → completed/failed/busy/no-answer
    │
    ▼
UpdateCallStatus → update `calls` table → emit VOICE_EVENTS.CALL_COMPLETED

Inbound Call Flow:
Phone rings → Twilio receives → hit TwiML endpoint
    │
    ▼
IVR: "Press 1 for Sales, 2 for Support"
    │
    ▼
Route to available agent (if busy → voicemail/queue)
    │
    ▼
Connect → record → track
```

---

## 3. TwiML Response Builder

```typescript
@Get('twiml/outbound')
generateOutboundTwiml(): string {
  const response = new Twilio.twiml.VoiceResponse();
  response.say({ voice: 'Polly.Amy', language: 'en-US' }, 
    'Connecting you now. Please hold briefly.');
  response.record({ 
    recordingStatusCallback: '/voice/recording/webhook',
    transcribeCallback: '/voice/transcription/webhook',
  });
  return response.toString();
}

@Post('twiml/inbound')
generateInboundTwiml(@Body() body: TwilioWebhookDto): string {
  const response = new Twilio.twiml.VoiceResponse();
  const gather = response.gather({ 
    numDigits: 1, 
    action: '/voice/twiml/route',
    timeout: 5 
  });
  gather.say('Welcome to AutopilotMonster. Press 1 for Sales. Press 2 for Support.');
  return response.toString();
}
```

---

## 4. Call Status State Machine

```
QUEUED → RINGING → IN_PROGRESS → COMPLETED
                              └→ FAILED
              └→ BUSY
              └→NO_ANSWER → (leave voicemail)
```

---

## 5. Recording & Transcription

```
Call completes → recording_url available from Twilio
    │
    ▼
POST /voice/recording/webhook
    │
    ▼
Download recording from Twilio URL
Store to MinIO: {tenant_id}-recordings/{call_id}.mp3
Update calls.recording_url = presigned MinIO URL
    │
    ▼
transcriptionQueue.add('transcribe', { tenantId, callId, audioUrl })
    │
    ├── Option 1: OpenAI Whisper API → high accuracy
    └── Option 2: Twilio built-in transcription → faster, lower cost
    │
    ▼
Save transcript to calls.transcription
    │
    ▼
aiQueue.add('summarize-call', { tenantId, callId, transcript })
  → GPT-4o summarizes: outcome, next steps, sentiment
  → Save to calls.ai_summary
    │
    ▼
Auto-create CRM activity: type=CALL, description=ai_summary
```

---

## 6. Voice Campaigns

Campaign flow:

```
Create campaign:
  { name, fromNumber, script, contactListId, scheduledAt }
    │
    ▼
Schedule campaign (BullMQ scheduler or cron)
    │
    ▼
Load contacts from contactListId
    │
    ▼
For each contact:
  voiceCampaignQueue.add('call-contact', {
    campaignId, contactId, fromNumber, toNumber, script
  }, { delay: i * 2000 }) // 2s between calls to avoid overwhelming Twilio
    │
    ▼
Each job: initiate call → handle TwiML script → record outcome
    │
    ▼
Campaign stats updated in real-time:
  calls_made++, calls_answered++, calls_failed++
```

---

## 7. IVR (Interactive Voice Response)

IVR flows are configurable per tenant. Stored as JSON:

```json
{
  "steps": [
    {
      "id": "main",
      "type": "menu",
      "message": "Press 1 for Sales. Press 2 for Support. Press 3 to leave a voicemail.",
      "options": {
        "1": { "route": "sales_team" },
        "2": { "route": "support_team" },
        "3": { "route": "voicemail" }
      }
    },
    {
      "id": "sales_team",
      "type": "forward",
      "to": "+15554440001"
    },
    {
      "id": "voicemail",
      "type": "record",
      "message": "Please leave your message after the beep."
    }
  ]
}
```

---

## 8. Voice Analytics

Tracked per tenant:

| Metric | Description |
|---|---|
| Total calls | Count by direction/status |
| Call duration | Average, median, total minutes |
| Answer rate | Answered / total initiated |
| Missed calls | Inbound not answered |
| Agent utilization | % time on calls |
| Hourly heatmap | Peak call times |
| Recording availability | % calls recorded |

---

## 9. Voice Limits by Plan

| Plan | Call Minutes/Month | Campaigns | IVR | Recording | Transcription |
|---|---|---|---|---|---|
| Starter | 200 | 1 | Basic | Yes | No |
| Professional | 2,000 | 10 | Full | Yes | Yes |
| Enterprise | 10,000 | Unlimited | Full | Yes | AI Summary |

---

## 10. Phone Number Management

- Tenant provisions phone numbers via Twilio Number Search API
- Numbers stored in `voice_phone_numbers` table
- Support: US, CA, GB, AU, IN, SG
- Number capabilities: voice, SMS, MMS
- Webhook routing: all inbound calls → `/voice/twiml/inbound?tenant={slug}`
