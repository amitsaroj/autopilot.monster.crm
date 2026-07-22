import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';

import { DealRepository } from './deal.repository';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { PipelineService } from './pipeline.service';
import { EVENT_NAMES } from '../../events/event.constants';
import { CrmListQueryDto } from './dto/crm.dto';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';
import { toPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class DealService {
  constructor(
    private readonly repository: DealRepository,
    private readonly pipelineService: PipelineService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(PipelineStage)
    private readonly stageRepository: Repository<PipelineStage>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(tenantId: string, pipelineId?: string): Promise<Deal[]> {
    const where: FindOptionsWhere<Deal> = {};
    if (pipelineId) {
      where.pipelineId = pipelineId;
    }

    return this.repository.findAll(tenantId, {
      where,
      relations: ['contact', 'company', 'stage'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPaginated(tenantId: string, query: CrmListQueryDto): Promise<IPaginatedResult<Deal>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.repository.findFiltered(tenantId, {
      ...query,
      page,
      limit,
    });
    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string): Promise<Deal> {
    const deal = await this.repository.findOne(tenantId, {
      where: { id },
      relations: ['contact', 'company', 'stage', 'pipeline'],
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }
    return deal;
  }

  async create(tenantId: string, data: Partial<Deal>, actorId?: string): Promise<Deal> {
    const deal = await this.repository.create(tenantId, data);
    this.eventEmitter.emit(EVENT_NAMES.DEAL_CREATED, { deal, tenantId, actorId });
    return deal;
  }

  async update(tenantId: string, id: string, data: Partial<Deal>, actorId?: string): Promise<Deal> {
    const deal = await this.repository.updateWithTenant(tenantId, id, data);
    this.eventEmitter.emit(EVENT_NAMES.DEAL_UPDATED, { deal, tenantId, actorId });
    return deal;
  }

  async remove(tenantId: string, id: string, actorId?: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.repository.delete(tenantId, id);
    this.eventEmitter.emit(EVENT_NAMES.DEAL_DELETED, { tenantId, deal: { id }, actorId });
  }

  async getBoard(tenantId: string, pipelineId?: string) {
    let pipeline;
    if (pipelineId) {
      pipeline = await this.pipelineService.findOne(tenantId, pipelineId);
    } else {
      pipeline = await this.pipelineService.findDefault(tenantId);
    }

    if (!pipeline) {
      return null;
    }

    const deals = await this.findAll(tenantId, pipeline.id);
    const ownerIds = [
      ...new Set(
        deals.map((deal) => deal.ownerId).filter((ownerId): ownerId is string => Boolean(ownerId)),
      ),
    ];
    const owners =
      ownerIds.length > 0
        ? await this.userRepository.find({ where: { tenantId, id: In(ownerIds) } })
        : [];
    const ownerMap = new Map(owners.map((owner) => [owner.id, owner.fullName]));

    return {
      pipeline,
      stages: pipeline.stages.map((stage) => ({
        ...stage,
        deals: deals
          .filter((deal) => deal.stageId === stage.id)
          .map((deal) => ({
            ...deal,
            ownerName: deal.ownerId ? (ownerMap.get(deal.ownerId) ?? 'Unassigned') : 'Unassigned',
          })),
      })),
    };
  }

  async moveStage(
    tenantId: string,
    dealId: string,
    stageId: string,
    changedBy?: string,
    reason?: string,
  ): Promise<Deal> {
    const deal = await this.findOne(tenantId, dealId);
    const stage = await this.stageRepository.findOne({ where: { id: stageId, tenantId } });
    if (!stage) {
      throw new NotFoundException('Pipeline stage not found');
    }

    const oldStageId = deal.stageId;
    const updated = await this.repository.updateWithTenant(tenantId, dealId, {
      stageId,
      probability: stage.probability,
    });

    this.eventEmitter.emit(EVENT_NAMES.DEAL_STAGE_CHANGED, {
      deal: updated,
      oldStageId,
      newStageId: stageId,
      tenantId,
      actorId: changedBy,
      changedBy,
      reason,
    });

    return updated;
  }

  async markWon(tenantId: string, dealId: string, changedBy?: string): Promise<Deal> {
    const deal = await this.findOne(tenantId, dealId);
    const oldStageId = deal.stageId;
    const updated = await this.repository.updateWithTenant(tenantId, dealId, {
      status: DealStatus.WON,
      probability: 100,
      actualCloseDate: new Date(),
    });

    this.eventEmitter.emit(EVENT_NAMES.DEAL_STAGE_CHANGED, {
      deal: updated,
      oldStageId,
      newStageId: deal.stageId,
      tenantId,
      actorId: changedBy,
      changedBy,
    });

    return updated;
  }

  async markLost(
    tenantId: string,
    dealId: string,
    lostReason?: string,
    changedBy?: string,
  ): Promise<Deal> {
    const deal = await this.findOne(tenantId, dealId);
    const oldStageId = deal.stageId;
    const updated = await this.repository.updateWithTenant(tenantId, dealId, {
      status: DealStatus.LOST,
      probability: 0,
      actualCloseDate: new Date(),
      lostReason,
    });

    this.eventEmitter.emit(EVENT_NAMES.DEAL_STAGE_CHANGED, {
      deal: updated,
      oldStageId,
      newStageId: deal.stageId,
      tenantId,
      actorId: changedBy,
      changedBy,
      reason: lostReason,
    });

    return updated;
  }

  async findByContact(tenantId: string, contactId: string): Promise<Deal[]> {
    return this.repository.findAll(tenantId, {
      where: { contactId },
      relations: ['stage', 'company'],
      order: { createdAt: 'DESC' },
    });
  }

  async reassignContact(
    tenantId: string,
    fromContactId: string,
    toContactId: string,
  ): Promise<void> {
    const deals = await this.repository.findAll(tenantId, { where: { contactId: fromContactId } });
    for (const deal of deals) {
      await this.repository.updateWithTenant(tenantId, deal.id, { contactId: toContactId });
    }
  }
}
