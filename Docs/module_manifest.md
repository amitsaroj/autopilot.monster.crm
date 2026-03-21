# Module Manifest Architecture
Project: autopilot.monster.crm

---

## 1. Dynamic Modules
AutopilotMonster is designed such that massive blocks of code (Modules) can be functionally turned on or off.

Each module folder contains a `module.manifest.json` describing its dependencies and system requirements.

```json
{
  "moduleId": "voice_engine",
  "displayName": "Voice & Telephony",
  "description": "Inbound and outbound calling via VoIP.",
  "dependsOn": ["crm", "billing"],
  "externalCredentials": ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
  "requiredPlans": ["Professional", "Enterprise"]
}
```

## 2. Why Manifests?
The startup sequence of the NestJS application reads these manifests. If a tenant provisions a Self-Hosted Enterprise isolated cluster, they might not purchase the Voice module. The build pipeline will prune the `voice` directory, and since it is decoupled via Manifests and Event Emitting, the rest of the CRM compiles and runs flawlessly without throwing `ModuleNotFound` exceptions for voice services.
