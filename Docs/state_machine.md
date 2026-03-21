# State Machine Configurations
Project: autopilot.monster.crm

---

## 1. XState for Complex Entities

While simple `status` enums work for basic entities, the CRM uses **XState** for highly complex, long-running state tracking like:
- **Campaign Execution:** (Draft → Scheduled → Running → Paused → Finished)
- **Workflow Instance:** (Initialized → Waiting → Executing → Suspended (Wait Block) → Resumed → Completed)

## 2. Transition Guards

The State Machine enforces that users cannot skip logic steps.
E.g. A campaign cannot move from `DRAFT` to `RUNNING` unless the Guard `hasValidPaymentMethod` and `hasSubscribedContacts` return true.

```typescript
const campaignMachine = createMachine({
  id: 'campaign',
  initial: 'DRAFT',
  states: {
    DRAFT: {
      on: {
        SCHEDULE: {
          target: 'SCHEDULED',
          cond: 'isValidAndFunded'
        }
      }
    },
    SCHEDULED: {
      on: {
        START: 'RUNNING',
        CANCEL: 'DRAFT'
      }
    },
    // ...
  }
});
```
The state representation is flattened to a string and stored in the database (`status`), but all transitions funnel through the machine to validate the state change.
