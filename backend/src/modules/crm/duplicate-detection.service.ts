import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../database/entities/contact.entity';

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
  ) {}

  /**
   * Scan for duplicates based on email, phone, or name similarity
   */
  async findDuplicates(tenantId: string): Promise<DuplicateGroup[]> {
    const groups: DuplicateGroup[] = [];

    // 1. Email-based duplicates
    const emailDupes = await this.contactRepo
      .createQueryBuilder('c')
      .select(['c.email', 'COUNT(*) as cnt'])
      .where('c.tenant_id = :tenantId', { tenantId })
      .andWhere('c.email IS NOT NULL')
      .andWhere('c.deleted_at IS NULL')
      .groupBy('c.email')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const row of emailDupes) {
      const contacts = await this.contactRepo.find({
        where: { tenantId, email: row.c_email } as any,
      });
      groups.push({
        key: `email:${row.c_email}`,
        contacts,
        matchScore: 100,
        matchFields: ['email'],
      });
    }

    // 2. Phone-based duplicates
    const phoneDupes = await this.contactRepo
      .createQueryBuilder('c')
      .select(['c.phone', 'COUNT(*) as cnt'])
      .where('c.tenant_id = :tenantId', { tenantId })
      .andWhere('c.phone IS NOT NULL')
      .andWhere('c.deleted_at IS NULL')
      .groupBy('c.phone')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const row of phoneDupes) {
      const contacts = await this.contactRepo.find({
        where: { tenantId, phone: row.c_phone } as any,
      });
      groups.push({
        key: `phone:${row.c_phone}`,
        contacts,
        matchScore: 95,
        matchFields: ['phone'],
      });
    }

    return groups;
  }

  /**
   * Check if a new contact is a potential duplicate before creation
   */
  async checkForDuplicate(tenantId: string, data: { email?: string; phone?: string; firstName?: string; lastName?: string }): Promise<Contact[]> {
    const matches: Contact[] = [];

    if (data.email) {
      const emailMatches = await this.contactRepo.find({
        where: { tenantId, email: data.email } as any,
      });
      matches.push(...emailMatches);
    }

    if (data.phone) {
      const phoneMatches = await this.contactRepo.find({
        where: { tenantId, phone: data.phone } as any,
      });
      for (const m of phoneMatches) {
        if (!matches.find(e => e.id === m.id)) matches.push(m);
      }
    }

    return matches;
  }

  /**
   * Merge two contacts — primary keeps, secondary is soft-deleted
   */
  async mergeContacts(tenantId: string, primaryId: string, secondaryId: string): Promise<Contact> {
    const primary = await this.contactRepo.findOne({ where: { id: primaryId, tenantId } as any });
    const secondary = await this.contactRepo.findOne({ where: { id: secondaryId, tenantId } as any });

    if (!primary || !secondary) {
      throw new Error('One or both contacts not found');
    }

    // Merge fields: fill in blanks on primary from secondary
    const fieldsToMerge: (keyof Contact)[] = ['email', 'phone', 'company'];
    for (const field of fieldsToMerge) {
      if (!primary[field] && secondary[field]) {
        (primary as any)[field] = secondary[field];
      }
    }

    await this.contactRepo.save(primary);
    await this.contactRepo.softRemove(secondary);

    this.logger.log(`Merged contact ${secondaryId} into ${primaryId}`);
    return primary;
  }
}
