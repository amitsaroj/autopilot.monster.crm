import { Injectable } from '@nestjs/common';
import { DealRepository } from './deal.repository';
import { Deal } from '../../database/entities/deal.entity';
import { PipelineService } from './pipeline.service';

@Injectable()
export class DealService {
  constructor(
    private readonly repository: DealRepository,
    private readonly pipelineService: PipelineService
  ) {}

  async findAll(tenantId: string, pipelineId?: string): Promise<Deal[]> {
    const where: any = { tenantId };
    if (pipelineId) where.pipelineId = pipelineId;
    
    return this.repository.findAll(tenantId, {
      where,
      relations: ['contact', 'company', 'stage'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(tenantId: string, id: string): Promise<Deal | null> {
    return this.repository.findOne(tenantId, {
      where: { id } as any,
      relations: ['contact', 'company', 'stage', 'pipeline']
    });
  }

  async create(tenantId: string, data: Partial<Deal>): Promise<Deal> {
    return this.repository.create(tenantId, data);
  }

  async update(tenantId: string, id: string, data: Partial<Deal>): Promise<Deal> {
    return this.repository.updateWithTenant(tenantId, id, data);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repository.delete(tenantId, id);
  }

  async getBoard(tenantId: string, pipelineId?: string) {
    let pipeline;
    if (pipelineId) {
      pipeline = await this.pipelineService.findOne(tenantId, pipelineId);
    } else {
      pipeline = await this.pipelineService.findDefault(tenantId);
    }
    
    if (!pipeline) return null;
    
    const deals = await this.findAll(tenantId, pipeline.id);
    
    return {
      pipeline,
      stages: pipeline.stages.map(stage => ({
        ...stage,
        deals: deals.filter(deal => deal.stageId === stage.id)
      }))
    };
  }
}
