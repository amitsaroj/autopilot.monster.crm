import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flow } from '../../database/entities/flow.entity';
import { WorkflowExecution } from '../../database/entities/workflow-execution.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class WorkflowRepository extends BaseRepository<Flow> {
  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,
    @InjectRepository(WorkflowExecution)
    private readonly executionRepo: Repository<WorkflowExecution>,
  ) {
    super(flowRepo);
  }

  async findExecutions(tenantId: string): Promise<WorkflowExecution[]> {
    return this.executionRepo.find({ where: { tenantId } as any, order: { startedAt: 'DESC' } });
  }

  async findActive(tenantId: string): Promise<Flow[]> {
    return this.flowRepo.find({ where: { tenantId, isPublished: true } as any });
  }

  async findExecutionById(tenantId: string, id: string): Promise<WorkflowExecution | null> {
    return this.executionRepo.findOne({ where: { id, tenantId } as any });
  }

  async updateExecution(
    tenantId: string,
    id: string,
    data: Partial<WorkflowExecution>,
  ): Promise<WorkflowExecution> {
    await this.executionRepo.update({ id, tenantId } as any, data);
    const updated = await this.findExecutionById(tenantId, id);
    if (!updated) {
      throw new Error(`Execution ${id} not found`);
    }
    return updated;
  }

  async findActiveByTrigger(tenantId: string, eventName: string): Promise<Flow[]> {
    return this.repository
      .createQueryBuilder('flow')
      .where('flow.tenantId = :tenantId', { tenantId })
      .andWhere('flow.isPublished = :published', { published: true })
      .andWhere(
        `(flow.definition->>'triggerEvent' = :eventName OR flow.definition->'trigger'->>'type' = :eventName)`,
        { eventName },
      )
      .getMany();
  }

  async createExecution(data: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    const execution = this.executionRepo.create(data);
    return this.executionRepo.save(execution);
  }
}
