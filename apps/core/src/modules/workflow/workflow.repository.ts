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
    flowRepo: Repository<Flow>,
    @InjectRepository(WorkflowExecution)
    private readonly executionRepo: Repository<WorkflowExecution>,
  ) {
    super(flowRepo);
  }

  async findExecutions(tenantId: string): Promise<WorkflowExecution[]> {
    return this.executionRepo.find({ where: { tenantId } as any, order: { startedAt: 'DESC' } });
  }

  async findExecutionById(tenantId: string, id: string): Promise<WorkflowExecution | null> {
    return this.executionRepo.findOne({ where: { id, tenantId } as any });
  }

  async createExecution(data: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    const execution = this.executionRepo.create(data);
    return this.executionRepo.save(execution);
  }
}
