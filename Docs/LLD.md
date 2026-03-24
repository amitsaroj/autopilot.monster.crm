# Low Level Design (LLD)
Project: autopilot.monster.crm  
Version: 1.0.0  
Date: 2024-03-21

---

## 1. Module Architecture

### 1.1 NestJS App Structure

```
apps/
  core/          ← Main API server
    src/
      modules/
        crm/
        billing/
        pricing/
        workflow/
        ai/
        voice/
        whatsapp/
        notifications/
        analytics/
        tenant/
        rbac/
        plugin/
        marketplace/
        storage/
        search/
        logs/
        metrics/
        scheduler/
        import/
        export/
        backup/
      common/
        guards/
        interceptors/
        filters/
        decorators/
        pipes/
        dto/
      shared/
        database/
        cache/
        queue/
        event-bus/
        mailer/
        config/
  auth/           ← Auth service
    src/
      auth/
      users/
      sessions/
      mfa/
  ui/             ← Next.js frontend
```

### 1.2 Standard Module Structure

Every module follows this pattern:

```
modules/{name}/
  {name}.module.ts
  {name}.controller.ts
  {name}.service.ts
  {name}.repository.ts
  entities/
    {name}.entity.ts
  dto/
    create-{name}.dto.ts
    update-{name}.dto.ts
    query-{name}.dto.ts
  guards/
  events/
    {name}.events.ts
  jobs/
    {name}.job.ts
  types/
    {name}.types.ts
```

---

## 2. Guard Chain

Every API request passes through this guard chain in order:

```
AuthGuard          → Validates JWT, sets req.user
TenantGuard        → Resolves tenant_id, sets req.tenant
RoleGuard          → Checks user role
PermissionGuard    → Checks resource:action permission
PlanGuard          → Checks feature is enabled for plan
LimitGuard         → Checks usage quota not exceeded
RateLimitGuard     → Checks request rate per tenant
```

### 2.1 TenantGuard Implementation

```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] 
      || request.user?.tenantId;
    
    if (!tenantId) throw new UnauthorizedException('No tenant context');
    
    const tenant = await this.tenantService.findActiveById(tenantId);
    if (!tenant) throw new ForbiddenException('Tenant not found or suspended');
    if (tenant.status === 'SUSPENDED') throw new ForbiddenException('Tenant suspended');
    
    request.tenant = tenant;
    return true;
  }
}
```

### 2.2 PlanGuard Implementation

```typescript
@Injectable()
export class PlanGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<string>('feature', context.getHandler());
    if (!feature) return true; // No feature required
    
    const { tenant } = context.switchToHttp().getRequest();
    const enabled = await this.pricingService.isFeatureEnabled(
      tenant.id, 
      feature
    );
    
    if (!enabled) throw new ForbiddenException(`Feature '${feature}' not available on your plan`);
    return true;
  }
}
```

---

## 3. Repository Pattern

All repositories extend a `BaseTenantRepository`:

```typescript
@Injectable()
export abstract class BaseTenantRepository<T> {
  constructor(
    protected readonly repository: Repository<T>,
  ) {}

  // All queries automatically filter by tenant_id
  protected get baseQuery(): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder('entity');
  }

  async findAll(tenantId: string, options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      where: { tenantId, ...options?.where } as any,
      ...options,
    });
  }

  async findById(tenantId: string, id: string): Promise<T | null> {
    return this.repository.findOne({
      where: { tenantId, id } as any,
    });
  }

  async save(tenantId: string, entity: Partial<T>): Promise<T> {
    return this.repository.save({ ...entity, tenantId } as any);
  }

  async softDelete(tenantId: string, id: string): Promise<void> {
    await this.repository.softDelete({ tenantId, id } as any);
  }
}
```

---

## 4. CRM Module — Detailed Design

### 4.1 Contacts Entity

```typescript
@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: false })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  department: string;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({ 
    type: 'enum',
    enum: ['LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED'],
    default: 'LEAD'
  })
  status: string;

  @Column({ 
    type: 'enum',
    enum: ['WEBSITE', 'LINKEDIN', 'REFERRAL', 'COLD_OUTREACH', 'EVENT', 'PARTNER', 'OTHER'],
    default: 'OTHER'
  })
  leadSource: string;

  @Column({ type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @Column({ name: 'last_contacted_at', nullable: true })
  lastContactedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
```

### 4.2 Deals Entity

```typescript
@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  value: number;

  @Column({ name: 'pipeline_id' })
  pipelineId: string;

  @Column({ name: 'stage_id' })
  stageId: string;

  @Column({ name: 'contact_id', nullable: true })
  contactId: string;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ 
    type: 'enum',
    enum: ['OPEN', 'WON', 'LOST'],
    default: 'OPEN'
  })
  status: string;

  @Column({ type: 'integer', default: 50 })
  probability: number;

  @Column({ name: 'expected_close_date', nullable: true })
  expectedCloseDate: Date;

  @Column({ name: 'actual_close_date', nullable: true })
  actualCloseDate: Date;

  @Column({ name: 'lost_reason', nullable: true })
  lostReason: string;

  @Column({ type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
```

---

## 5. Workflow Engine — Detailed Design

### 5.1 Workflow Entity

```typescript
@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], default: 'DRAFT' })
  status: string;

  @Column({ name: 'trigger_type' })
  triggerType: string; // 'CONTACT_CREATED', 'DEAL_UPDATED', 'SCHEDULE', 'WEBHOOK', 'MANUAL'

  @Column({ name: 'trigger_config', type: 'jsonb', default: {} })
  triggerConfig: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  steps: WorkflowStep[];

  @Column({ type: 'integer', default: 0 })
  runs: number;

  @Column({ type: 'integer', default: 0 })
  failures: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 5.2 Workflow Step Types

```typescript
type WorkflowStepType = 
  | 'SEND_EMAIL'
  | 'SEND_WHATSAPP'
  | 'SEND_SMS'
  | 'CREATE_TASK'
  | 'CREATE_DEAL'
  | 'UPDATE_CONTACT'
  | 'UPDATE_DEAL'
  | 'ASSIGN_OWNER'
  | 'ADD_TAG'
  | 'REMOVE_TAG'
  | 'CALL_WEBHOOK'
  | 'WAIT_DELAY'
  | 'CONDITION_BRANCH'
  | 'AI_RESPONSE'
  | 'NOTIFY_TEAM'
  | 'ADD_TO_CAMPAIGN'
  | 'MOVE_PIPELINE_STAGE';

interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  config: Record<string, any>;
  nextStepId?: string;
  onFailureStepId?: string;
  retryCount: number;
  retryDelaySeconds: number;
  timeoutSeconds: number;
}
```

### 5.3 Workflow Execution Engine

```typescript
@Processor('workflow')
export class WorkflowProcessor {
  async process(job: Job<WorkflowJobData>): Promise<void> {
    const { workflowId, tenantId, triggerData } = job.data;
    
    const execution = await this.workflowExecutionRepo.create({
      workflowId,
      tenantId,
      status: 'RUNNING',
      triggerData,
      startedAt: new Date(),
    });

    try {
      const workflow = await this.workflowRepo.findById(tenantId, workflowId);
      const context = { triggerData, variables: {}, execution };
      
      for (const step of workflow.steps) {
        await this.executeStep(step, context, tenantId);
      }
      
      await this.workflowExecutionRepo.update(execution.id, { 
        status: 'COMPLETED', 
        completedAt: new Date() 
      });
    } catch (error) {
      await this.workflowExecutionRepo.update(execution.id, {
        status: 'FAILED',
        error: error.message,
        completedAt: new Date(),
      });
      throw error; // BullMQ retry
    }
  }
}
```

---

## 6. Billing Engine — Detailed Design

### 6.1 Plan Feature Check

```typescript
@Injectable()
export class PricingService {
  async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    // 1. Check cache first
    const cacheKey = `feature:${tenantId}:${featureKey}`;
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) return cached === 'true';

    // 2. Get tenant subscription
    const subscription = await this.subscriptionRepo.findActiveByTenant(tenantId);
    if (!subscription) return false;

    // 3. Get plan features
    const planFeature = await this.planFeatureRepo.findByPlanAndKey(
      subscription.planId, 
      featureKey
    );

    // 4. Check for tenant override
    const override = await this.tenantFeatureOverrideRepo.findByTenantAndKey(
      tenantId, 
      featureKey
    );

    const result = override?.enabled ?? planFeature?.enabled ?? false;
    
    // 5. Cache result for 5 minutes
    await this.redis.setex(cacheKey, 300, result.toString());
    
    return result;
  }

  async checkLimit(tenantId: string, metric: string): Promise<LimitCheckResult> {
    const subscription = await this.subscriptionRepo.findActiveByTenant(tenantId);
    const limit = await this.planLimitRepo.findByPlanAndMetric(subscription.planId, metric);
    
    if (!limit) return { allowed: true, used: 0, limit: -1 }; // Unlimited

    // Get current usage from Redis counter
    const periodKey = this.getCurrentPeriodKey(metric);
    const usageKey = `usage:${tenantId}:${metric}:${periodKey}`;
    const used = parseInt(await this.redis.get(usageKey) || '0', 10);

    return {
      allowed: used < limit.value,
      used,
      limit: limit.value,
      remaining: Math.max(0, limit.value - used),
    };
  }

  async incrementUsage(tenantId: string, metric: string, amount = 1): Promise<void> {
    const periodKey = this.getCurrentPeriodKey(metric);
    const usageKey = `usage:${tenantId}:${metric}:${periodKey}`;
    
    await this.redis.incrby(usageKey, amount);
    
    // Persist to DB asynchronously
    await this.usageQueue.add('record-usage', {
      tenantId, metric, amount, period: periodKey
    });
  }
}
```

---

## 7. AI Engine — Detailed Design

### 7.1 AI Agent Config Schema

```typescript
interface AIAgentConfig {
  id: string;
  tenantId: string;
  name: string;
  purpose: string;
  model: 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet';
  temperature: number; // 0.0 - 1.0
  maxTokens: number;
  systemPrompt: string;
  knowledgeBaseIds: string[];
  channels: ('chat' | 'whatsapp' | 'email' | 'voice')[];
  tools: AITool[];
  memoryEnabled: boolean;
  memoryWindowMessages: number;
  fallbackBehavior: 'HUMAN_HANDOFF' | 'APOLOGIZE' | 'RETRY';
  status: 'ACTIVE' | 'PAUSED';
}
```

### 7.2 RAG Pipeline

```typescript
@Injectable()
export class RAGService {
  async query(tenantId: string, agentId: string, userMessage: string): Promise<string> {
    // 1. Embed the user message
    const queryEmbedding = await this.embedService.embed(userMessage);
    
    // 2. Search Qdrant for relevant chunks
    const agent = await this.agentRepo.findById(tenantId, agentId);
    const searchResults = await this.qdrantClient.search(
      `tenant_${tenantId}`,
      {
        vector: queryEmbedding,
        filter: {
          must: [
            { key: 'knowledge_base_id', match: { any: agent.knowledgeBaseIds } }
          ]
        },
        limit: 5,
        with_payload: true,
      }
    );

    // 3. Build context from retrieved chunks
    const context = searchResults
      .filter(r => r.score > 0.7)
      .map(r => r.payload.text)
      .join('\n\n');

    // 4. Build prompt with context
    const prompt = this.buildRAGPrompt(agent.systemPrompt, context, userMessage);
    
    // 5. Call LLM
    return this.llmService.complete(prompt, {
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
    });
  }
}
```

---

## 8. Voice Engine — Detailed Design

### 8.1 Call Flow

```
Outbound Call:
User → API → VoiceService → TwilioClient → Phone Number
                       ↓
               BullMQ 'calls' queue
                       ↓
               CallProcessor (tracks state, recording, status)
                       ↓
               Twilio Webhook → PostCallHandler
                       ↓
               Transcription (Whisper API)
                       ↓
               AI Summary → CRM Activity Record
```

### 8.2 Call Entity

```typescript
@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'contact_id', nullable: true })
  contactId: string;

  @Column({ name: 'deal_id', nullable: true })
  dealId: string;

  @Column({ name: 'caller_id' })
  callerId: string; // User who made/received call

  @Column({ name: 'twilio_call_sid', nullable: true })
  twilioCallSid: string;

  @Column({ name: 'from_number' })
  fromNumber: string;

  @Column({ name: 'to_number' })
  toNumber: string;

  @Column({ 
    type: 'enum',
    enum: ['INBOUND', 'OUTBOUND'],
  })
  direction: string;

  @Column({ 
    type: 'enum',
    enum: ['QUEUED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'MISSED', 'BUSY'],
    default: 'QUEUED'
  })
  status: string;

  @Column({ type: 'integer', default: 0 })
  durationSeconds: number;

  @Column({ name: 'recording_url', nullable: true })
  recordingUrl: string;

  @Column({ name: 'transcription', type: 'text', nullable: true })
  transcription: string;

  @Column({ name: 'ai_summary', type: 'text', nullable: true })
  aiSummary: string;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

## 9. Event Bus Design

### 9.1 All Event Types

```typescript
export const CRM_EVENTS = {
  CONTACT_CREATED: 'crm.contact.created',
  CONTACT_UPDATED: 'crm.contact.updated',
  CONTACT_DELETED: 'crm.contact.deleted',
  DEAL_CREATED: 'crm.deal.created',
  DEAL_UPDATED: 'crm.deal.updated',
  DEAL_STAGE_CHANGED: 'crm.deal.stage.changed',
  DEAL_WON: 'crm.deal.won',
  DEAL_LOST: 'crm.deal.lost',
  COMPANY_CREATED: 'crm.company.created',
  LEAD_CREATED: 'crm.lead.created',
  LEAD_CONVERTED: 'crm.lead.converted',
} as const;

export const BILLING_EVENTS = {
  SUBSCRIPTION_CREATED: 'billing.subscription.created',
  SUBSCRIPTION_UPGRADED: 'billing.subscription.upgraded',
  SUBSCRIPTION_DOWNGRADED: 'billing.subscription.downgraded',
  SUBSCRIPTION_CANCELLED: 'billing.subscription.cancelled',
  SUBSCRIPTION_EXPIRED: 'billing.subscription.expired',
  INVOICE_CREATED: 'billing.invoice.created',
  INVOICE_PAID: 'billing.invoice.paid',
  INVOICE_OVERDUE: 'billing.invoice.overdue',
  PAYMENT_FAILED: 'billing.payment.failed',
  LIMIT_REACHED: 'billing.limit.reached',
  USAGE_THRESHOLD: 'billing.usage.threshold',
} as const;

export const WORKFLOW_EVENTS = {
  WORKFLOW_TRIGGERED: 'workflow.triggered',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
  STEP_EXECUTED: 'workflow.step.executed',
} as const;

export const AI_EVENTS = {
  AGENT_CONVERSATION_STARTED: 'ai.conversation.started',
  AGENT_CONVERSATION_ENDED: 'ai.conversation.ended',
  AI_MESSAGE_SENT: 'ai.message.sent',
  KNOWLEDGE_BASE_UPDATED: 'ai.knowledge.updated',
  HUMAN_HANDOFF_REQUESTED: 'ai.handoff.requested',
} as const;

export const VOICE_EVENTS = {
  CALL_STARTED: 'voice.call.started',
  CALL_ANSWERED: 'voice.call.answered',
  CALL_COMPLETED: 'voice.call.completed',
  CALL_FAILED: 'voice.call.failed',
  CALL_MISSED: 'voice.call.missed',
  RECORDING_AVAILABLE: 'voice.recording.available',
  TRANSCRIPTION_COMPLETED: 'voice.transcription.completed',
} as const;

export const WHATSAPP_EVENTS = {
  MESSAGE_RECEIVED: 'whatsapp.message.received',
  MESSAGE_SENT: 'whatsapp.message.sent',
  MESSAGE_DELIVERED: 'whatsapp.message.delivered',
  MESSAGE_READ: 'whatsapp.message.read',
  MESSAGE_FAILED: 'whatsapp.message.failed',
  TEMPLATE_APPROVED: 'whatsapp.template.approved',
} as const;
```

---

## 10. Queue Architecture

### 10.1 BullMQ Queues

| Queue Name | Purpose | Concurrency | Retry |
|---|---|---|---|
| `workflow` | Workflow execution jobs | 10 | 3x exp backoff |
| `ai-completion` | LLM API calls | 5 | 2x exp backoff |
| `voice-calls` | Call initiation/tracking | 20 | 1x |
| `email` | Email sends (SMTP) | 10 | 3x |
| `whatsapp` | WhatsApp messages | 20 | 3x |
| `notifications` | Push/in-app notifications | 50 | 2x |
| `usage-record` | Usage persistence | 100 | 5x |
| `transcription` | Audio transcription | 5 | 2x |
| `vector-index` | Qdrant indexing | 3 | 3x |
| `report` | Analytics report generation | 2 | 1x |
| `backup` | Tenant data backup | 2 | 1x |
| `webhook` | Outbound webhook delivery | 20 | 5x exp backoff |
| `import` | Bulk data import | 3 | 2x |
| `export` | Bulk data export | 3 | 1x |

### 10.2 Retry Strategy

```typescript
const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // 2s, 4s, 8s
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};
```

---

## 11. API Response Format

All API responses follow this format:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 284,
    "totalPages": 15
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "email must be an email" }
    ]
  }
}

// Paginated list
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 284,
    "totalPages": 15
  }
}
```

---

## 12. RBAC Permission Matrix

| Role | CRM | Billing | Admin | Workflows | Analytics | Settings |
|---|---|---|---|---|---|---|
| Super Admin | Full | Full | Full | Full | Full | Full |
| Tenant Admin | Full | Read | None | Full | Full | Full |
| Sales Manager | Full | Read | None | Full | Full | Read |
| Sales Rep | Own | None | None | Read | Own | None |
| Support | Read | None | None | Read | None | None |
| Billing Admin | Read | Full | None | None | Read | Read |
| Read Only | Read | None | None | None | Read | None |

### 12.1 Permission Format

```
resource:action
crm:read
crm:write
crm:delete
billing:read
billing:manage
admin:tenants
admin:users
workflow:execute
ai:chat
voice:calls
```

---

## 13. Storage Design

### 13.1 MinIO Buckets

```
{tenant_id}-files/          ← User uploaded files
{tenant_id}-recordings/     ← Call recordings
{tenant_id}-exports/        ← Data exports
{tenant_id}-imports/        ← Data import uploads
{tenant_id}-kb/             ← Knowledge base documents
system-backups/             ← Tenant backup archives
system-avatars/             ← User/company avatars
system-templates/           ← Email/WhatsApp templates
```

### 13.2 File Upload Flow

```
Client → API (multipart) → StorageService → MinIO
                               ↓
                         DB record (storage_files)
                               ↓
                         (if KB doc) → vector-index queue
                               ↓
                         Return presigned URL
```

---

## 14. Search Design

### 14.1 Full-Text Search

Uses PostgreSQL `tsvector` for fast full-text search on:

- contacts (name, email, phone, company)
- deals (name, description)
- companies (name, domain, industry)
- products (name, description, sku)

### 14.2 Vector Search

Uses Qdrant collections per tenant:

```
Collection: tenant_{tenant_id}
  Vectors: 1536-dim (OpenAI text-embedding-3-small)
  Payload: { source_type, source_id, knowledge_base_id, chunk_index, text }
```

---

## 15. JWT Token Design

```typescript
// Access Token Payload (15 min expiry)
{
  sub: 'user-uuid',
  tenantId: 'tenant-uuid',
  email: 'autopilot.monster@gmail.com',
  role: 'SALES_REP',
  permissions: ['crm:read', 'crm:write'],
  iat: 1700000000,
  exp: 1700000900,
}

// Refresh Token Payload (30 day expiry)  
{
  sub: 'user-uuid',
  sessionId: 'session-uuid',
  tenantId: 'tenant-uuid',
  iat: 1700000000,
  exp: 1702592000,
}
```
