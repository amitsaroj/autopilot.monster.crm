import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipelineRepository } from './pipeline.repository';
import { Pipeline } from '../../database/entities/pipeline.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { Deal } from '../../database/entities/deal.entity';
import { CreatePipelineDto, CreatePipelineStageDto, UpdatePipelineDto } from './dto/crm.dto';

@Injectable()
export class PipelineService {
  constructor(
    private readonly repository: PipelineRepository,
    @InjectRepository(PipelineStage)
    private readonly stageRepo: Repository<PipelineStage>,
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
  ) {}

  async findAll(tenantId: string): Promise<Pipeline[]> {
    return this.repository.findAll(tenantId, {
      relations: ['stages'],
      order: { order: 'ASC', stages: { order: 'ASC' } },
    });
  }

  async findDefault(tenantId: string): Promise<Pipeline | null> {
    const pipelines = await this.findAll(tenantId);
    return pipelines[0] || null;
  }

  async findOne(tenantId: string, id: string): Promise<Pipeline> {
    const pipeline = await this.repository.findOne(tenantId, {
      where: { id },
      relations: ['stages'],
      order: { stages: { order: 'ASC' } },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async create(tenantId: string, data: CreatePipelineDto): Promise<Pipeline> {
    const { stages, ...rest } = data;
    return this.repository.create(tenantId, {
      ...rest,
      ...(stages !== undefined
        ? { stages: stages.map((stage) => this.stageRepo.create({ ...stage, tenantId })) }
        : {}),
    });
  }

  async createStage(
    tenantId: string,
    pipelineId: string,
    data: CreatePipelineStageDto,
  ): Promise<PipelineStage> {
    await this.findOne(tenantId, pipelineId);
    const stage = this.stageRepo.create({ ...data, pipelineId, tenantId });
    return this.stageRepo.save(stage);
  }

  async update(tenantId: string, id: string, data: UpdatePipelineDto): Promise<Pipeline> {
    await this.findOne(tenantId, id);
    await this.repository.updateWithTenant(tenantId, id, data);
    return this.findOne(tenantId, id);
  }

  /** Refuses while any deal (including soft-deleted ones, which still hold the FK) uses it. */
  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    const deals = await this.dealRepo.count({
      where: { tenantId, pipelineId: id },
      withDeleted: true,
    });
    if (deals > 0) {
      throw new ConflictException(
        `Pipeline is used by ${deals} deal(s); move or delete them before deleting the pipeline`,
      );
    }
    await this.repository.hardDelete(tenantId, id);
  }
}
