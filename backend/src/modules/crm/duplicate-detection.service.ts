import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../database/entities/contact.entity';
import { ContactService } from './contact.service';
import { CheckDuplicateDto } from './dto/crm.dto';

export interface DuplicateGroup {
  key: string;
  contacts: Contact[];
  matchScore: number;
  matchFields: string[];
}

@Injectable()
export class DuplicateDetectionService {
  private readonly logger = new Logger(DuplicateDetectionService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    private readonly contactService: ContactService,
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
      const alreadyCovered = groups.some((g) =>
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

  async mergeContacts(tenantId: string, primaryId: string, secondaryId: string): Promise<Contact> {
    const primary = await this.contactRepo.findOne({ where: { id: primaryId, tenantId } });
    const secondary = await this.contactRepo.findOne({ where: { id: secondaryId, tenantId } });

    if (!primary || !secondary) {
      throw new NotFoundException('One or both contacts not found');
    }

    const merged = await this.contactService.mergeContacts(tenantId, primaryId, secondaryId);
    this.logger.log(`Merged contact ${secondaryId} into ${primaryId}`);
    return merged;
  }
}
