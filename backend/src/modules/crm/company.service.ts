import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyRepository } from './company.repository';
import { Company } from '../../database/entities/company.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Activity } from '../../database/entities/activity.entity';

@Injectable()
export class CompanyService {
  constructor(
    private readonly repository: CompanyRepository,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(tenantId: string, data: Partial<Company>): Promise<Company> {
    return this.repository.create(tenantId, data);
  }

  async findAll(tenantId: string): Promise<Company[]> {
    return this.repository.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<Company> {
    const company = await this.repository.findById(tenantId, id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(tenantId: string, id: string, data: Partial<Company>): Promise<Company> {
    return this.repository.updateWithTenant(tenantId, id, data);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.repository.delete(tenantId, id);
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
