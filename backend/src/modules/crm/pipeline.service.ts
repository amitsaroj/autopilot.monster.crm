import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipelineRepository } from './pipeline.repository';
import { Pipeline } from '../../database/entities/pipeline.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';

@Injectable()
export class PipelineService {
  constructor(
    private readonly repository: PipelineRepository,
    @InjectRepository(PipelineStage)
    private readonly stageRepo: Repository<PipelineStage>
  ) {}

  async findAll(tenantId: string): Promise<Pipeline[]> {
    return this.repository.findAll(tenantId, {
      relations: ['stages'],
      order: { order: 'ASC', stages: { order: 'ASC' } }
    });
  }

  async findDefault(tenantId: string): Promise<Pipeline | null> {
    const pipelines = await this.findAll(tenantId);
    return pipelines[0] || null;
  }

  async findOne(tenantId: string, id: string): Promise<Pipeline | null> {
    return this.repository.findOne(tenantId, {
      where: { id } as any,
      relations: ['stages'],
      order: { stages: { order: 'ASC' } }
    });
  }

  async create(tenantId: string, data: Partial<Pipeline>): Promise<Pipeline> {
    return this.repository.create(tenantId, data);
  }

  async createStage(tenantId: string, pipelineId: string, data: Partial<PipelineStage>): Promise<PipelineStage> {
    const stage = this.stageRepo.create({ ...data, pipelineId, tenantId });
    return this.stageRepo.save(stage);
  }

  async update(tenantId: string, id: string, data: Partial<Pipeline>): Promise<Pipeline> {
    return this.repository.updateWithTenant(tenantId, id, data);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repository.delete(tenantId, id);
  }
}
