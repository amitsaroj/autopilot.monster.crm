import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';

import { Flow } from '../../database/entities/flow.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/flow.dto';

@Injectable()
export class FlowService {
  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,
  ) {}

  async findAll(tenantId: string): Promise<Flow[]> {
    return this.flowRepo.find({ where: { tenantId } });
  }

  async findOne(tenantId: string, id: string): Promise<Flow> {
    const flow = await this.flowRepo.findOne({ where: { id, tenantId } });
    if (!flow) throw new NotFoundException('Flow not found');
    return flow;
  }

  async create(tenantId: string, data: CreateWorkflowDto): Promise<Flow> {
    const dto = await this.validateDraft(CreateWorkflowDto, data);
    const flow = this.flowRepo.create({
      tenantId,
      name: dto.name,
      description: dto.description,
      type: dto.type ?? 'voice',
      definition: {
        ...dto.definition,
        ...(dto.triggerEvent !== undefined ? { triggerEvent: dto.triggerEvent } : {}),
      },
      isPublished: false,
      publishedVersionId: null,
    });
    return this.flowRepo.save(flow);
  }

  async update(tenantId: string, id: string, data: UpdateWorkflowDto): Promise<Flow> {
    const flow = await this.findOne(tenantId, id);
    const dto = await this.validateDraft(UpdateWorkflowDto, data);
    if (flow.isPublished || flow.publishedVersionId) {
      throw new BadRequestException(
        'Edit published flows through /workflows/:id to preserve workflow validation and versioning',
      );
    }
    // Never spread client input into an entity or pass it directly to Repository.update.
    if (dto.name !== undefined) flow.name = dto.name;
    if (dto.description !== undefined) flow.description = dto.description;
    if (dto.type !== undefined) flow.type = dto.type;
    if (dto.definition !== undefined || dto.triggerEvent !== undefined) {
      flow.definition = {
        ...(dto.definition ?? flow.definition),
        ...(dto.triggerEvent !== undefined ? { triggerEvent: dto.triggerEvent } : {}),
      };
    }
    flow.isPublished = false;
    flow.publishedVersionId = null;
    // Scope the write as well as the read, and do not overwrite a concurrent publish.
    const result = await this.flowRepo
      .createQueryBuilder()
      .update()
      .set({
        name: flow.name,
        description: flow.description,
        type: flow.type,
        definition: () => ':definition',
        isPublished: false,
        publishedVersionId: null,
      })
      .setParameter('definition', JSON.stringify(flow.definition))
      .where(
        'id = :id AND tenant_id = :tenantId AND "isPublished" = false AND published_version_id IS NULL AND deleted_at IS NULL',
        { id, tenantId },
      )
      .execute();
    if (result.affected !== 1) {
      throw new BadRequestException(
        'Flow changed or was published; reload and use /workflows/:id for published flows',
      );
    }
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.flowRepo.softDelete({ id, tenantId });
  }

  private async validateDraft<T extends UpdateWorkflowDto>(
    dtoClass: new () => T,
    data: T,
  ): Promise<T> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Flow must be a workflow draft object');
    }
    if (data.isPublished === true) {
      throw new BadRequestException(
        'CRM flows can only save drafts; use POST /workflows/:id/publish to validate and publish',
      );
    }
    const dto = plainToInstance(dtoClass, data);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) {
      throw new BadRequestException({
        message: 'Invalid workflow draft',
        fields: errors.map((error) => error.property),
      });
    }
    for (const field of [
      'name',
      'description',
      'type',
      'definition',
      'triggerEvent',
      'isPublished',
    ] as const) {
      if (dto[field] === null) throw new BadRequestException(`${field} cannot be null`);
    }
    return dto;
  }
}
