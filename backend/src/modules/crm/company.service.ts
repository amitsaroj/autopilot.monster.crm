import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyRepository } from './company.repository';
import { EVENT_NAMES } from '../../events/event.constants';
import { Company } from '../../database/entities/company.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Activity } from '../../database/entities/activity.entity';
import { Note } from '../../database/entities/note.entity';
import { CreateCompanyDto, CrmListQueryDto, UpdateCompanyDto } from './dto/crm.dto';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';
import { toPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class CompanyService {
  constructor(
    private readonly repository: CompanyRepository,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async create(tenantId: string, data: CreateCompanyDto, actorId?: string): Promise<Company> {
    const company = await this.repository.create(tenantId, data);
    this.eventEmitter.emit(EVENT_NAMES.COMPANY_CREATED, { company, tenantId, actorId });
    return company;
  }

  async findAll(tenantId: string): Promise<Company[]> {
    return this.repository.findAll(tenantId);
  }

  async findPaginated(
    tenantId: string,
    query: CrmListQueryDto,
  ): Promise<IPaginatedResult<Company>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.repository.findFiltered(tenantId, {
      ...query,
      page,
      limit,
    });
    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string): Promise<Company> {
    const company = await this.repository.findById(tenantId, id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(
    tenantId: string,
    id: string,
    data: UpdateCompanyDto,
    actorId?: string,
  ): Promise<Company> {
    await this.findOne(tenantId, id);
    const company = await this.repository.updateWithTenant(tenantId, id, data);
    this.eventEmitter.emit(EVENT_NAMES.COMPANY_UPDATED, { company, tenantId, actorId });
    return company;
  }

  async delete(tenantId: string, id: string, actorId?: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.repository.hardDelete(tenantId, id);
    this.eventEmitter.emit(EVENT_NAMES.COMPANY_DELETED, { tenantId, company: { id }, actorId });
  }

  async mergeCompanies(
    tenantId: string,
    primaryId: string,
    secondaryId: string,
    actorId?: string,
  ): Promise<Company> {
    if (primaryId === secondaryId) {
      throw new BadRequestException('Cannot merge company with itself');
    }

    const primary = await this.findOne(tenantId, primaryId);
    const secondary = await this.findOne(tenantId, secondaryId);

    await this.repository.updateWithTenant(tenantId, primaryId, {
      website: primary.website || secondary.website,
      domain: primary.domain || secondary.domain,
      industry: primary.industry || secondary.industry,
      phone: primary.phone || secondary.phone,
      address: primary.address || secondary.address,
      city: primary.city || secondary.city,
      country: primary.country || secondary.country,
      logoUrl: primary.logoUrl || secondary.logoUrl,
      sizeRange: primary.sizeRange || secondary.sizeRange,
      annualRevenueRange: primary.annualRevenueRange || secondary.annualRevenueRange,
      tags: Array.from(new Set([...(primary.tags ?? []), ...(secondary.tags ?? [])])),
    });

    await this.contactRepository.update(
      { tenantId, companyId: secondaryId },
      { companyId: primaryId },
    );
    await this.dealRepository.update(
      { tenantId, companyId: secondaryId },
      { companyId: primaryId },
    );
    await this.activityRepository.update(
      { tenantId, companyId: secondaryId },
      { companyId: primaryId },
    );
    await this.noteRepository.update(
      { tenantId, companyId: secondaryId },
      { companyId: primaryId },
    );
    await this.repository.hardDelete(tenantId, secondaryId);

    const merged = await this.findOne(tenantId, primaryId);
    this.eventEmitter.emit(EVENT_NAMES.COMPANY_MERGED, {
      tenantId,
      primaryId,
      secondaryId,
      company: merged,
      actorId,
    });
    return merged;
  }

  async getContacts(tenantId: string, companyId: string): Promise<Contact[]> {
    await this.findOne(tenantId, companyId);
    return this.contactRepository.find({
      where: { tenantId, companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDeals(tenantId: string, companyId: string): Promise<Deal[]> {
    await this.findOne(tenantId, companyId);
    return this.dealRepository.find({
      where: { tenantId, companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getActivities(tenantId: string, companyId: string): Promise<Activity[]> {
    await this.findOne(tenantId, companyId);
    return this.activityRepository.find({
      where: { tenantId, companyId },
      order: { occurredAt: 'DESC' },
    });
  }
}
