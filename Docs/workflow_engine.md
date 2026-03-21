# Workflow Engine Design
Project: autopilot.monster.crm

---

## 1. Overview

The workflow engine allows tenants to automate business processes using a trigger → condition → action model. Workflows execute asynchronously via BullMQ. Each execution is fully logged and retryable.

---

## 2. Trigger Types

| Trigger Key | Description | Config Example |
|---|---|---|
| `CONTACT_CREATED` | New contact created | `{ source: 'WEBSITE' }` (optional filter) |
| `CONTACT_UPDATED` | Contact field changed | `{ field: 'status', to: 'CUSTOMER' }` |
| `DEAL_CREATED` | New deal created | `{ pipelineId: 'uuid' }` |
| `DEAL_STAGE_CHANGED` | Deal moved to stage | `{ toStageId: 'uuid' }` |
| `DEAL_WON` | Deal marked won | `{}` |
| `DEAL_LOST` | Deal marked lost | `{ reason: 'PRICE' }` |
| `LEAD_CREATED` | New lead created | `{}` |
| `LEAD_CONVERTED` | Lead converted | `{}` |
| `TASK_DUE` | Task past due  | `{}` |
| `QUOTE_ACCEPTED` | Quote signed | `{}` |
| `CALL_COMPLETED` | Voice call ended | `{ direction: 'OUTBOUND' }` |
| `WHATSAPP_MESSAGE_RECEIVED` | WA message inbound | `{ keyword: 'pricing' }` |
| `SCHEDULE` | Cron schedule | `{ cron: '0 9 * * 1-5' }` |
| `FORM_SUBMITTED` | Builder form submit | `{ formId: 'uuid' }` |
| `WEBHOOK` | External webhook | `{ secret: '...' }` |
| `MANUAL` | Triggered by user | `{}` |

---

## 3. Condition Types (Branching Logic)

```typescript
type ConditionOperator = 
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'greater_than' | 'less_than'
  | 'is_empty' | 'is_not_empty'
  | 'in' | 'not_in';

interface WorkflowCondition {
  field: string;          // e.g., 'contact.status', 'deal.value'
  operator: ConditionOperator;
  value: any;
  and?: WorkflowCondition[];
  or?: WorkflowCondition[];
}
```

---

## 4. Action Types

| Action Key | Description | Config Fields |
|---|---|---|
| `SEND_EMAIL` | Send templated email | `templateId, to, subject, variables` |
| `SEND_WHATSAPP` | Send WA message | `templateId, toNumber, variables` |
| `SEND_SMS` | Send SMS | `to, message` |
| `CREATE_TASK` | Create CRM task | `title, dueInHours, assigneeId, priority` |
| `CREATE_DEAL` | Create deal | `name, pipelineId, stageId, value` |
| `UPDATE_CONTACT` | Update contact field | `field, value` |
| `UPDATE_DEAL` | Update deal field | `field, value` |
| `MOVE_PIPELINE_STAGE` | Move deal stage | `dealId, stageId` |
| `ASSIGN_OWNER` | Reassign owner | `ownerId` |
| `ADD_TAG` | Add tag(s) | `tags: string[]` |
| `REMOVE_TAG` | Remove tag | `tag: string` |
| `CALL_WEBHOOK` | POST to external URL | `url, headers, body` |
| `WAIT_DELAY` | Pause execution | `delayHours, delayDays` |
| `CONDITION_BRANCH` | Branch by condition | `conditions, ifTrue, ifFalse` |
| `AI_RESPONSE` | Call AI agent | `agentId, channel` |
| `NOTIFY_TEAM` | Notify via Slack/email | `channel, message` |
| `ADD_TO_CAMPAIGN` | Add to voice/WA campaign | `campaignId` |
| `LOG` | Write to execution log | `message, level` |

---

## 5. Workflow Step JSON Schema

```json
{
  "id": "step-uuid-1",
  "type": "SEND_EMAIL",
  "name": "Send Welcome Email",
  "config": {
    "templateId": "tmpl-welcome",
    "to": "{{contact.email}}",
    "variables": {
      "firstName": "{{contact.firstName}}",
      "dealName": "{{deal.name}}"
    }
  },
  "nextStepId": "step-uuid-2",
  "onFailureStepId": null,
  "retryCount": 3,
  "retryDelaySeconds": 60,
  "timeoutSeconds": 30
}
```

---

## 6. Template Variables

Workflow configs support `{{variable}}` syntax:

| Variable | Value |
|---|---|
| `{{contact.firstName}}` | Contact's first name |
| `{{contact.email}}` | Contact's email |
| `{{contact.phone}}` | Contact's phone |
| `{{deal.name}}` | Deal name |
| `{{deal.value}}` | Deal value |
| `{{deal.stage}}` | Current stage name |
| `{{company.name}}` | Company name |
| `{{tenant.name}}` | Workspace name |
| `{{user.name}}` | Owner's full name |
| `{{now}}` | Current timestamp |
| `{{trigger.data.*}}` | Raw trigger payload fields |

---

## 7. Execution Flow

```
Trigger fires → WorkflowTriggerService.evaluate(trigger, payload)
    │
    ├── Find all ACTIVE workflows matching this trigger type + filters
    │
    ├── For each matching workflow:
    │   └── workflowQueue.add('execute', { workflowId, tenantId, triggerData })
    │
    ▼
BullMQ Worker picks up job
    │
    ├── Load workflow from DB
    ├── Create workflow_execution record (status: RUNNING)
    ├── Initialize context: { triggerData, variables: {}, stepResults: {} }
    │
    ├── For each step in workflow.steps:
    │   ├── Evaluate conditions (if CONDITION_BRANCH)
    │   ├── Execute action handler
    │   ├── Apply retry logic on failure
    │   ├── Write step result to context
    │   └── Log step execution
    │
    ├── Update execution: status=COMPLETED / FAILED
    └── Emit: workflow.completed / workflow.failed
```

---

## 8. Retry Strategy

```typescript
const workflowQueueConfig: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  // 2s → 4s → 8s
};

// Per-step retry (inside processor):
async executeStepWithRetry(step, context, attempt = 0): Promise<void> {
  try {
    await this.executeStep(step, context);
  } catch (err) {
    if (attempt < step.retryCount) {
      await sleep(step.retryDelaySeconds * 1000);
      return this.executeStepWithRetry(step, context, attempt + 1);
    }
    if (step.onFailureStepId) {
      return this.executeStep(step.onFailureStepId, context);
    }
    throw err;
  }
}
```

---

## 9. Workflow Limits by Plan

| Plan | Max Workflows | Max Steps/Workflow | Max Executions/Day |
|---|---|---|---|
| Starter | 5 | 10 | 500 |
| Professional | 50 | 25 | 5,000 |
| Enterprise | Unlimited | 100 | Unlimited |

---

## 10. Workflow Builder (UI)

The workflow builder renders each step as a visual node in a flowchart. Built with React Flow:

- **Trigger node**: Top of graph, non-draggable
- **Action nodes**: Visual cards with step type icon + config summary
- **Condition nodes**: Diamond shape with if/else branches
- **Wait nodes**: Clock icon + delay config
- **Connection lines**: Drag-and-drop between nodes

Each node has a config panel on the right sidebar.
