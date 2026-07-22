import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../database/entities/contact.entity';
import { Company } from '../../database/entities/company.entity';
import { ContactService } from './contact.service';
import { CompanyService } from './company.service';
import { CheckDuplicateDto } from './dto/crm.dto';

export interface DuplicateGroup {
  key: string;
  contacts: Contact[];
  matchScore: number;
  matchFields: string[];
}

export interface CompanyDuplicateGroup {
  key: string;
  companies: Company[];
  matchScore: number;
  matchFields: string[];
}

@Injectable()
export class DuplicateDetectionService {
  private readonly logger = new Logger(DuplicateDetectionService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly contactService: ContactService,
    private readonly companyService: CompanyService,
  ) {}

  async findDuplicates(tenantId: string): Promise<DuplicateGroup[]> {
    const groups: DuplicateGroup[] = [];

    const emailDupes = await this.contactRepo
      .createQueryBuilder('c')
      .select('c.email', 'email')
      .addSelect('COUNT(*)', 'cnt')
      .where('c.tenant_id = :tenantId', { tenantId })
      .andWhere('c.email IS NOT NULL')
      .andWhere('c.deleted_at IS NULL')
      .groupBy('c.email')
      .having('COUNT(*) > 1')
      .getRawMany<{ email: string; cnt: string }>();

    for (const row of emailDupes) {
      const contacts = await this.contactRepo.find({
        where: { tenantId, email: row.email },
      });
      groups.push({
        key: `email:${row.email}`,
        contacts,
        matchScore: 100,
        matchFields: ['email'],
      });
    }

    const phoneDupes = await this.contactRepo
      .createQueryBuilder('c')
      .select('c.phone', 'phone')
      .addSelect('COUNT(*)', 'cnt')
      .where('c.tenant_id = :tenantId', { tenantId })
      .andWhere('c.phone IS NOT NULL')
      .andWhere("c.phone <> ''")
      .andWhere('c.deleted_at IS NULL')
      .groupBy('c.phone')
      .having('COUNT(*) > 1')
      .getRawMany<{ phone: string; cnt: string }>();

    for (const row of phoneDupes) {
      const contacts = await this.contactRepo.find({
        where: { tenantId, phone: row.phone },
      });
      const alreadyCovered = groups.some(
        (g) =>
          g.contacts.every((c) => contacts.some((m) => m.id === c.id)) &&
          contacts.every((c) => g.contacts.some((m) => m.id === c.id)),
      );
      if (alreadyCovered) {
        continue;
      }
      groups.push({
        key: `phone:${row.phone}`,
        contacts,
        matchScore: 95,
        matchFields: ['phone'],
      });
    }

    return groups;
  }

  async findCompanyDuplicates(tenantId: string): Promise<CompanyDuplicateGroup[]> {
    const groups: CompanyDuplicateGroup[] = [];

    const domainDupes = await this.companyRepo
      .createQueryBuilder('c')
      .select('LOWER(c.domain)', 'domain')
      .addSelect('COUNT(*)', 'cnt')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.domain IS NOT NULL')
      .andWhere("c.domain <> ''")
      .groupBy('LOWER(c.domain)')
      .having('COUNT(*) > 1')
      .getRawMany<{ domain: string; cnt: string }>();

    for (const row of domainDupes) {
      const companies = await this.companyRepo
        .createQueryBuilder('c')
        .where('c.tenantId = :tenantId', { tenantId })
        .andWhere('LOWER(c.domain) = :domain', { domain: row.domain })
        .getMany();
      groups.push({
        key: `domain:${row.domain}`,
        companies,
        matchScore: 100,
        matchFields: ['domain'],
      });
    }

    const nameDupes = await this.companyRepo
      .createQueryBuilder('c')
      .select('LOWER(c.name)', 'name')
      .addSelect('COUNT(*)', 'cnt')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.name IS NOT NULL')
      .andWhere("c.name <> ''")
      .groupBy('LOWER(c.name)')
      .having('COUNT(*) > 1')
      .getRawMany<{ name: string; cnt: string }>();

    for (const row of nameDupes) {
      const companies = await this.companyRepo
        .createQueryBuilder('c')
        .where('c.tenantId = :tenantId', { tenantId })
        .andWhere('LOWER(c.name) = :name', { name: row.name })
        .getMany();
      const alreadyCovered = groups.some(
        (g) =>
          g.companies.every((c) => companies.some((m) => m.id === c.id)) &&
          companies.every((c) => g.companies.some((m) => m.id === c.id)),
      );
      if (alreadyCovered) {
        continue;
      }
      groups.push({
        key: `name:${row.name}`,
        companies,
        matchScore: 90,
        matchFields: ['name'],
      });
    }

    return groups;
  }

  async checkForDuplicate(tenantId: string, data: CheckDuplicateDto): Promise<Contact[]> {
    const matches: Contact[] = [];

    if (data.email) {
      const emailMatches = await this.contactRepo.find({
        where: { tenantId, email: data.email },
      });
      matches.push(...emailMatches);
    }

    if (data.phone) {
      const phoneMatches = await this.contactRepo.find({
        where: { tenantId, phone: data.phone },
      });
      for (const match of phoneMatches) {
        if (!matches.find((existing) => existing.id === match.id)) {
          matches.push(match);
        }
      }
    }

    return matches;
  }

  async mergeContacts(
    tenantId: string,
    primaryId: string,
    secondaryId: string,
    actorId?: string,
  ): Promise<Contact> {
    const primary = await this.contactRepo.findOne({ where: { id: primaryId, tenantId } });
    const secondary = await this.contactRepo.findOne({ where: { id: secondaryId, tenantId } });

    if (!primary || !secondary) {
      throw new NotFoundException('One or both contacts not found');
    }

    const merged = await this.contactService.mergeContacts(
      tenantId,
      primaryId,
      secondaryId,
      actorId,
    );
    this.logger.log(`Merged contact ${secondaryId} into ${primaryId}`);
    return merged;
  }

  async mergeCompanies(
    tenantId: string,
    primaryId: string,
    secondaryId: string,
    actorId?: string,
  ): Promise<Company> {
    const primary = await this.companyRepo.findOne({ where: { id: primaryId, tenantId } });
    const secondary = await this.companyRepo.findOne({ where: { id: secondaryId, tenantId } });

    if (!primary || !secondary) {
      throw new NotFoundException('One or both companies not found');
    }

    const merged = await this.companyService.mergeCompanies(
      tenantId,
      primaryId,
      secondaryId,
      actorId,
    );
    this.logger.log(`Merged company ${secondaryId} into ${primaryId}`);
    return merged;
  }
}
