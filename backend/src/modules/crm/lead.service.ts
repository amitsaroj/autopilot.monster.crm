import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lead } from '../../database/entities/lead.entity';
import { EVENT_NAMES } from '../../events/event.constants';
import { LeadScoringService } from './lead-scoring.service';
import { CreateLeadDto, CrmListQueryDto, UpdateLeadDto } from './dto/crm.dto';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';
import { toPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly leadScoringService: LeadScoringService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string) {
    return this.leadRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findPaginated(
    tenantId: string,
    query: CrmListQueryDto,
  ): Promise<IPaginatedResult<Lead>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.leadRepo
      .createQueryBuilder('l')
      .where('l.tenant_id = :tenantId', { tenantId })
      .andWhere('l.deleted_at IS NULL');

    if (query.search) {
      qb.andWhere(
        '(l.first_name ILIKE :search OR l.last_name ILIKE :search OR l.email ILIKE :search OR l.phone ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('l.status = :status', { status: query.status });
    }

    qb.orderBy('l.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.leadRepo.findOne({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async create(tenantId: string, data: CreateLeadDto) {
    const score = this.leadScoringService.computeScore(data);
    const lead = this.leadRepo.create({ ...data, tenantId, score });
    const saved = await this.leadRepo.save(lead);
    this.eventEmitter.emit(EVENT_NAMES.LEAD_CREATED, { lead: saved, tenantId });
    return saved;
  }

  async bulkCreate(tenantId: string, leads: CreateLeadDto[]) {
    const leadEntities = leads.map((l) =>
      this.leadRepo.create({
        ...l,
        tenantId,
        score: this.leadScoringService.computeScore(l),
      }),
    );
    const saved = await this.leadRepo.save(leadEntities);
    for (const lead of saved) {
      this.eventEmitter.emit(EVENT_NAMES.LEAD_CREATED, { lead, tenantId });
    }
    return saved;
  }

  async update(tenantId: string, id: string, data: UpdateLeadDto) {
    const existing = await this.findOne(tenantId, id);
    const merged = { ...existing, ...data };
    const score = this.leadScoringService.computeScore(merged);
    await this.leadRepo.update({ id, tenantId }, { ...data, score } as never);
    const lead = await this.findOne(tenantId, id);
    this.eventEmitter.emit(EVENT_NAMES.LEAD_UPDATED, { lead, tenantId });
    return lead;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.leadRepo.softDelete({ id, tenantId });
    this.eventEmitter.emit(EVENT_NAMES.LEAD_DELETED, { tenantId, lead: { id } });
  }
}
