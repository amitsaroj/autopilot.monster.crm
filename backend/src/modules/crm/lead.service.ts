import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { createHash } from 'crypto';

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

  async findPaginated(tenantId: string, query: CrmListQueryDto): Promise<IPaginatedResult<Lead>> {
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

  async create(tenantId: string, data: CreateLeadDto, actorId?: string) {
    const result = await this.leadRepo.manager.transaction(async (manager) => {
      await this.lockLeadIdentities(manager, tenantId, [data]);
      const existing = await this.findMatchingLead(manager, tenantId, data);
      if (existing) return { lead: existing, created: false };
      const repository = manager.getRepository(Lead);
      const lead = repository.create({
        ...data,
        tenantId,
        score: this.leadScoringService.computeScore(data),
      });
      return { lead: await repository.save(lead), created: true };
    });
    if (result.created)
      this.eventEmitter.emit(EVENT_NAMES.LEAD_CREATED, { lead: result.lead, tenantId, actorId });
    return result.lead;
  }

  async createFromWorkflow(
    tenantId: string,
    data: CreateLeadDto,
    idempotencyKey: string,
    workflowDepth: number,
  ) {
    if (!idempotencyKey.trim() || idempotencyKey.length > 200)
      throw new Error('Workflow lead creation requires a valid idempotency key');
    if (!Number.isInteger(workflowDepth) || workflowDepth < 1 || workflowDepth > 8)
      throw new Error('Workflow lead creation exceeded the event causation limit');
    const workflowActionKey = createHash('sha256').update(idempotencyKey).digest('hex');
    const result = await this.leadRepo.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [
        'workflow-create-lead',
        `${tenantId}:${idempotencyKey}`,
      ]);
      await this.lockLeadIdentities(manager, tenantId, [data]);
      const leads = manager.getRepository(Lead);
      const existing = await leads
        .createQueryBuilder('lead')
        .where('lead.tenantId = :tenantId', { tenantId })
        .andWhere("lead.metadata ->> 'workflowActionKey' = :workflowActionKey", {
          workflowActionKey,
        })
        .getOne();
      if (existing) return { lead: existing, created: false };
      const identityMatch = await this.findMatchingLead(manager, tenantId, data);
      if (identityMatch) return { lead: identityMatch, created: false };
      const lead = leads.create({
        ...data,
        tenantId,
        metadata: { ...data.metadata, workflowActionKey },
        score: this.leadScoringService.computeScore(data),
      });
      return { lead: await leads.save(lead), created: true };
    });
    if (result.created)
      this.eventEmitter.emit(EVENT_NAMES.LEAD_CREATED, {
        lead: result.lead,
        tenantId,
        workflowDepth,
      });
    return result.lead;
  }

  private leadIdentityKeys(
    tenantId: string,
    data: Pick<CreateLeadDto, 'phone' | 'email'>,
  ): string[] {
    const phone = data.phone?.replace(/\D/g, '');
    const email = data.email?.trim().toLowerCase();
    return [
      ...(phone && phone.length >= 8 && phone.length <= 15 ? [`phone:${phone}`] : []),
      ...(email ? [`email:${email}`] : []),
    ].map((identity) => `${tenantId}:${createHash('sha256').update(identity).digest('hex')}`);
  }

  private async lockLeadIdentities(
    manager: EntityManager,
    tenantId: string,
    records: Pick<CreateLeadDto, 'phone' | 'email'>[],
  ): Promise<void> {
    const keys = [
      ...new Set(records.flatMap((record) => this.leadIdentityKeys(tenantId, record))),
    ].sort();
    for (const key of keys)
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [
        'crm-lead-identity',
        key,
      ]);
  }

  private async findMatchingLead(
    manager: EntityManager,
    tenantId: string,
    data: Pick<CreateLeadDto, 'phone' | 'email'>,
  ): Promise<Lead | null> {
    const phone = data.phone?.replace(/\D/g, '');
    const email = data.email?.trim().toLowerCase();
    if ((!phone || phone.length < 8 || phone.length > 15) && !email) return null;
    const matches = await manager
      .getRepository(Lead)
      .createQueryBuilder('lead')
      .where('lead.tenantId = :tenantId', { tenantId })
      .andWhere('lead.deletedAt IS NULL')
      .andWhere(
        new Brackets((identity) => {
          if (phone && phone.length >= 8 && phone.length <= 15)
            identity.orWhere("regexp_replace(lead.phone, '[^0-9]', '', 'g') = :phone", { phone });
          if (email) identity.orWhere('lower(btrim(lead.email)) = :email', { email });
        }),
      )
      .take(2)
      .getMany();
    if (matches.length > 1)
      throw new ConflictException('Lead identity matches multiple records; resolve duplicates first');
    return matches[0] ?? null;
  }

  async bulkCreate(tenantId: string, leads: CreateLeadDto[], actorId?: string) {
    const result = await this.leadRepo.manager.transaction(async (manager) => {
      await this.lockLeadIdentities(manager, tenantId, leads);
      const repository = manager.getRepository(Lead);
      const records: { lead: Lead; created: boolean }[] = [];
      for (const data of leads) {
        const existing = await this.findMatchingLead(manager, tenantId, data);
        if (existing) records.push({ lead: existing, created: false });
        else {
          const lead = repository.create({
            ...data,
            tenantId,
            score: this.leadScoringService.computeScore(data),
          });
          records.push({ lead: await repository.save(lead), created: true });
        }
      }
      return records;
    });
    for (const { lead, created } of result)
      if (created) this.eventEmitter.emit(EVENT_NAMES.LEAD_CREATED, { lead, tenantId, actorId });
    return result.map(({ lead }) => lead);
  }

  async update(tenantId: string, id: string, data: UpdateLeadDto, actorId?: string) {
    const existing = await this.findOne(tenantId, id);
    const merged = { ...existing, ...data };
    const score = this.leadScoringService.computeScore(merged);
    await this.leadRepo.update({ id, tenantId }, { ...data, score } as never);
    const lead = await this.findOne(tenantId, id);
    this.eventEmitter.emit(EVENT_NAMES.LEAD_UPDATED, { lead, tenantId, actorId });
    return lead;
  }

  async remove(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    await this.leadRepo.softDelete({ id, tenantId });
    this.eventEmitter.emit(EVENT_NAMES.LEAD_DELETED, { tenantId, lead: { id }, actorId });
  }
}
