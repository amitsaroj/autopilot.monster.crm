import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryDeepPartialEntity, Repository } from 'typeorm';
import { Flow } from '../../database/entities/flow.entity';
import { WorkflowExecution } from '../../database/entities/workflow-execution.entity';
import { WorkflowVersion } from '../../database/entities/workflow-version.entity';
import {
  WorkflowLifecycleOutbox,
  WorkflowLifecycleEventName,
} from '../../database/entities/workflow-lifecycle-outbox.entity';
import { BaseRepository } from '../../database/base.repository';
import { definitionHash } from './workflow-definition';

@Injectable()
export class WorkflowRepository extends BaseRepository<Flow> {
  constructor(
    @InjectRepository(Flow) private readonly flowRepo: Repository<Flow>,
    @InjectRepository(WorkflowExecution)
    private readonly executionRepo: Repository<WorkflowExecution>,
    @InjectRepository(WorkflowLifecycleOutbox)
    private readonly lifecycleOutbox: Repository<WorkflowLifecycleOutbox>,
  ) {
    super(flowRepo);
  }

  transaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.flowRepo.manager.transaction(work);
  }

  async saveFlow(tenantId: string, data: Partial<Flow>, manager: EntityManager): Promise<Flow> {
    const repo = manager.getRepository(Flow);
    return repo.save(repo.create({ ...data, tenantId }));
  }

  async snapshot(flow: Flow, manager?: EntityManager): Promise<WorkflowVersion> {
    const repo = (manager ?? this.flowRepo.manager).getRepository(WorkflowVersion);
    const hash = definitionHash(flow.definition);
    await repo
      .createQueryBuilder()
      .insert()
      .values({
        tenantId: flow.tenantId,
        flowId: flow.id,
        definitionHash: hash,
        schemaVersion: 1,
        definition: flow.definition as QueryDeepPartialEntity<Flow>['definition'],
      })
      .orIgnore()
      .execute();
    const version = await repo.findOneBy({
      tenantId: flow.tenantId,
      flowId: flow.id,
      definitionHash: hash,
    });
    if (!version) throw new Error('Workflow version creation failed');
    return version;
  }

  findVersions(tenantId: string, flowId: string): Promise<WorkflowVersion[]> {
    return this.flowRepo.manager.getRepository(WorkflowVersion).find({
      where: { tenantId, flowId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  findExecutions(tenantId: string, flowId?: string): Promise<WorkflowExecution[]> {
    return this.executionRepo.find({
      where: { tenantId, ...(flowId ? { flowId } : {}) },
      order: { startedAt: 'DESC' },
      take: 100,
    });
  }

  findActive(tenantId: string): Promise<Flow[]> {
    return this.flowRepo.find({ where: { tenantId, isPublished: true } });
  }

  findPublishedByType(tenantId: string, type: Flow['type']): Promise<Flow[]> {
    return this.flowRepo.find({
      where: { tenantId, isPublished: true, type },
      order: { updatedAt: 'DESC' },
    });
  }

  findExecutionById(tenantId: string, id: string): Promise<WorkflowExecution | null> {
    return this.executionRepo.findOneBy({ id, tenantId });
  }

  async updateExecution(
    tenantId: string,
    id: string,
    data: Partial<WorkflowExecution>,
  ): Promise<WorkflowExecution> {
    await this.executionRepo.update(
      { id, tenantId },
      data as QueryDeepPartialEntity<WorkflowExecution>,
    );
    const execution = await this.findExecutionById(tenantId, id);
    if (!execution) throw new Error(`Execution ${id} not found`);
    return execution;
  }

  findActiveByTrigger(tenantId: string, eventName: string): Promise<Flow[]> {
    return this.flowRepo
      .createQueryBuilder('flow')
      .where('flow.tenantId = :tenantId', { tenantId })
      .andWhere('flow.isPublished = :published', { published: true })
      .andWhere(
        `(flow.definition->>'triggerEvent' = :eventName OR flow.definition->'trigger'->>'type' = :eventName)`,
        { eventName },
      )
      .getMany();
  }

  createExecution(data: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    return this.executionRepo.save(this.executionRepo.create(data));
  }

  async createOnce(
    data: Partial<WorkflowExecution>,
  ): Promise<{ execution: WorkflowExecution; created: boolean }> {
    const result = await this.executionRepo
      .createQueryBuilder()
      .insert()
      .values(data as QueryDeepPartialEntity<WorkflowExecution>)
      .orIgnore()
      .returning('id')
      .execute();
    const id = (result.raw as Array<{ id: string }>)[0]?.id;
    const execution = id
      ? await this.findExecutionById(data.tenantId!, id)
      : await this.executionRepo.findOneBy({
          tenantId: data.tenantId!,
          flowId: data.flowId!,
          eventId: data.eventId!,
        });
    if (!execution) throw new Error('Workflow execution creation failed');
    return { execution, created: Boolean(id) };
  }

  async claim(
    tenantId: string,
    id: string,
    generation: number,
    token: string,
  ): Promise<WorkflowExecution | null> {
    const claimed = await this.flowRepo.manager.transaction(async (manager) => {
      const result = await manager
        .getRepository(WorkflowExecution)
        .createQueryBuilder()
        .update()
        .set({
          leaseToken: token,
          leaseExpiresAt: new Date(Date.now() + 90000),
          status: 'RUNNING',
        })
        .where('id = :id AND tenant_id = :tenantId AND dispatch_generation = :generation', {
          id,
          tenantId,
          generation,
        })
        .andWhere("status IN ('QUEUED','RUNNING','PAUSED')")
        .andWhere("(pause_reason IS NULL OR pause_reason='delay')")
        .andWhere('(resume_at IS NULL OR resume_at <= now())')
        .andWhere('(lease_expires_at IS NULL OR lease_expires_at < now())')
        .execute();
      if (!result.affected) return false;
      const execution = await manager.getRepository(WorkflowExecution).findOneBy({ id, tenantId });
      if (!execution) throw new Error('Claimed workflow execution disappeared');
      await this.insertLifecycleEvent(manager, execution, 'workflow.started');
      return true;
    });
    return claimed ? this.findExecutionById(tenantId, id) : null;
  }

  private async insertLifecycleEvent(
    manager: EntityManager,
    execution: WorkflowExecution,
    event: WorkflowLifecycleEventName,
  ): Promise<void> {
    const eventId = `workflow:${execution.id}:${event}:${execution.dispatchGeneration}`;
    await manager
      .getRepository(WorkflowLifecycleOutbox)
      .createQueryBuilder()
      .insert()
      .values({
        tenantId: execution.tenantId,
        workflowId: execution.flowId,
        executionId: execution.id,
        event,
        eventId,
        payload: {
          tenantId: execution.tenantId,
          workflowId: execution.flowId,
          executionId: execution.id,
          versionId: execution.versionId ?? undefined,
          eventId,
        },
      })
      .orIgnore()
      .execute();
  }

  async checkpoint(
    tenantId: string,
    id: string,
    token: string,
    data: Partial<WorkflowExecution>,
  ): Promise<void> {
    await this.flowRepo.manager.transaction(async (manager) => {
      const result = await manager
        .getRepository(WorkflowExecution)
        .update(
          { id, tenantId, leaseToken: token },
          data as QueryDeepPartialEntity<WorkflowExecution>,
        );
      if (!result.affected) throw new ConflictException('Workflow execution lease was lost');
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        const execution = await manager
          .getRepository(WorkflowExecution)
          .findOneBy({ id, tenantId });
        if (!execution) throw new Error('Completed workflow execution disappeared');
        const event = data.status === 'COMPLETED' ? 'workflow.completed' : 'workflow.failed';
        await this.insertLifecycleEvent(manager, execution, event);
      }
    });
  }

  claimLifecycleEvents(limit: number): Promise<WorkflowLifecycleOutbox[]> {
    return this.lifecycleOutbox.query(
      `WITH due AS (
         SELECT id FROM workflow_lifecycle_outbox
         WHERE (status='PENDING' AND next_attempt_at<=now())
            OR (status='PROCESSING' AND lease_expires_at<now())
         ORDER BY created_at LIMIT $1 FOR UPDATE SKIP LOCKED
       )
       UPDATE workflow_lifecycle_outbox AS event SET status='PROCESSING', attempts=event.attempts+1,
         lease_expires_at=now()+interval '60 seconds', updated_at=now()
       FROM due WHERE event.id=due.id
       RETURNING event.id,event.tenant_id AS "tenantId",event.workflow_id AS "workflowId",
         event.execution_id AS "executionId",event.event,event.event_id AS "eventId",event.payload,event.attempts`,
      [limit],
    );
  }

  async markLifecycleEventDelivered(id: string): Promise<void> {
    await this.lifecycleOutbox.update(
      { id, status: 'PROCESSING' },
      { status: 'DELIVERED', dispatchedAt: new Date(), leaseExpiresAt: null, lastError: null },
    );
  }

  async retryLifecycleEvent(id: string): Promise<void> {
    await this.lifecycleOutbox
      .createQueryBuilder()
      .update()
      .set({
        status: 'PENDING',
        nextAttemptAt: () =>
          `now() + make_interval(secs => LEAST(3600.0, 5.0 * power(2.0, LEAST(attempts, 10)))::double precision)`,
        leaseExpiresAt: null,
        lastError: 'event dispatch failed',
      })
      .where('id=:id AND status=:status', { id, status: 'PROCESSING' })
      .execute();
  }

  heartbeat(tenantId: string, id: string, token: string): Promise<void> {
    return this.checkpoint(tenantId, id, token, { leaseExpiresAt: new Date(Date.now() + 90000) });
  }

  async retry(tenantId: string, id: string): Promise<WorkflowExecution> {
    const result = await this.executionRepo
      .createQueryBuilder()
      .update()
      .set({
        status: 'QUEUED',
        error: null,
        completedAt: null,
        leaseToken: null,
        leaseExpiresAt: null,
        pauseReason: null,
        resumeAt: null,
        dispatchGeneration: () => 'dispatch_generation + 1',
      })
      .where('id=:id AND tenant_id=:tenantId', { id, tenantId })
      .andWhere("status='FAILED'")
      .andWhere('(lease_expires_at IS NULL OR lease_expires_at < now())')
      .execute();
    if (!result.affected)
      throw new ConflictException('Execution is not failed or is still being processed');
    return (await this.findExecutionById(tenantId, id))!;
  }

  async resumePublished(tenantId: string, flowId: string): Promise<void> {
    await this.executionRepo
      .createQueryBuilder()
      .update()
      .set({
        pauseReason: null,
        status: 'QUEUED',
        dispatchGeneration: () => 'dispatch_generation + 1',
      })
      .where('tenant_id=:tenantId AND flow_id=:flowId', { tenantId, flowId })
      .andWhere("status='PAUSED' AND pause_reason IN ('unpublished','entitlement')")
      .andWhere('(lease_expires_at IS NULL OR lease_expires_at < now())')
      .execute();
  }

  async controlExecution(
    tenantId: string,
    id: string,
    action: 'pause' | 'resume' | 'cancel',
  ): Promise<WorkflowExecution> {
    const update: QueryDeepPartialEntity<WorkflowExecution> =
      action === 'resume'
        ? {
            status: 'QUEUED',
            pauseReason: 'delay',
            dispatchGeneration: () => 'dispatch_generation + 1',
          }
        : action === 'pause'
          ? { status: 'PAUSED', pauseReason: 'manual' }
          : {
              status: 'CANCELLED',
              pauseReason: 'USER_CANCELLED',
              completedAt: new Date(),
              currentStepId: null,
              resumeAt: null,
            };
    const result = await this.executionRepo
      .createQueryBuilder()
      .update()
      .set(update)
      .where('id=:id AND tenant_id=:tenantId', { id, tenantId })
      .andWhere(
        action === 'resume'
          ? "status='PAUSED' AND pause_reason='manual'"
          : "status IN ('QUEUED','PAUSED')",
      )
      .andWhere('(lease_expires_at IS NULL OR lease_expires_at < now())')
      .execute();
    if (!result.affected)
      throw new ConflictException(
        'Only idle queued or waiting executions can be controlled; a currently running action cannot be interrupted',
      );
    return (await this.findExecutionById(tenantId, id))!;
  }

  /** DB-backed dispatch recovery after Redis/enqueue failures and worker crashes. */
  recoverable(): Promise<WorkflowExecution[]> {
    return this.executionRepo
      .createQueryBuilder('run')
      .innerJoin(Flow, 'flow', 'flow.id=run.flowId AND flow.tenantId=run.tenantId')
      .where('flow.isPublished = true')
      .andWhere("run.status IN ('QUEUED','RUNNING','PAUSED')")
      .andWhere("(run.pauseReason IS NULL OR run.pauseReason='delay')")
      .andWhere('(run.resumeAt IS NULL OR run.resumeAt <= now())')
      .andWhere('(run.leaseExpiresAt IS NULL OR run.leaseExpiresAt < now())')
      .orderBy('run.updatedAt', 'ASC')
      .take(100)
      .getMany();
  }
}
