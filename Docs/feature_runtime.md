# Feature Runtime
Project: autopilot.monster.crm

---

## 1. Feature Flag Evaluation Speed
Since Feature Flags control everything from UI visibility to critical workflow steps, they must resolve in < 2ms.

The `FeatureResolver` parses the evaluation hierarchy into a 1-byte status and caches it in a Redis `Hash`.

```redis
HSET tenant_features:uuid1 "voice_campaigns" "1"
HSET tenant_features:uuid1 "ai_agents" "0"
```

## 2. Guarding the Action

```typescript
@Get('/voice')
@RequireFeature('voice_calls')
async getVoiceData() { ... }
```

If the Guard fails, the API responds with a specialized `403` payload that instructs the frontend UI to display an Upsell Modal.

```json
{
  "status": 403,
  "error": "FEATURE_LOCKED",
  "message": "Voice Calling requires the Professional Plan.",
  "metadata": {
    "requiredPlan": "Professional",
    "featureCode": "voice_calls"
  }
}
```

## 3. UI Reaction
The Next.js `axios` interceptor catches the `FEATURE_LOCKED` error and globally triggers a Zustand state action:
`setUpsellModal({ isOpen: true, feature: response.metadata })` to drive immediate conversion.
