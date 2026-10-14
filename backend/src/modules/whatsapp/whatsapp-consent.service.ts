import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppConsent } from '../../database/entities/whatsapp-consent.entity';
import { Contact } from '../../database/entities/contact.entity';
import { RecordWhatsappConsentDto, UpdateWhatsappPreferencesDto } from './dto/whatsapp-consent.dto';

@Injectable()
export class WhatsappConsentService {
  constructor(
    @InjectRepository(WhatsAppConsent) private readonly records: Repository<WhatsAppConsent>,
    @InjectRepository(Contact) private readonly contacts: Repository<Contact>,
  ) {}

  normalizePhone(input: string): string {
    if (!/^\+?[1-9][\d\s().-]{7,25}$/.test(input.trim())) {
      throw new BadRequestException('Use an international phone number including its country code');
    }
    const phone = input.replace(/\D/g, '');
    if (!/^[1-9]\d{7,14}$/.test(phone))
      throw new BadRequestException('Invalid international phone number');
    return phone;
  }

  async findContact(tenantId: string, phone: string): Promise<Contact | null> {
    return this.contacts
      .createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere(
        "(regexp_replace(c.phone, '[^0-9]', '', 'g') = :phone OR regexp_replace(c.mobile, '[^0-9]', '', 'g') = :phone)",
        { phone },
      )
      .getOne();
  }

  async getEligibility(
    tenantId: string,
    input: string,
    purpose: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE',
  ) {
    const phone = this.normalizePhone(input);
    const contact = await this.findContact(tenantId, phone);
    if (purpose === 'MARKETING' && contact?.customFields?.whatsappMarketingEnabled === false) {
      return {
        eligible: false,
        reason: 'Marketing messaging is disabled in customer preferences',
        contactId: contact.id,
      };
    }
    const history = await this.records.find({
      where: { tenantId, phone },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: 100,
    });
    const latest = history.find((record) => record.scope === 'ALL' || record.scope === purpose);
    const suppressed = history.find((record) => record.scope === 'ALL');
    if (
      contact?.doNotContact ||
      suppressed?.status === 'OPTED_OUT' ||
      latest?.status === 'OPTED_OUT'
    ) {
      return {
        eligible: false,
        reason: 'This recipient has opted out or is suppressed',
        contactId: contact?.id,
      };
    }
    const eligible =
      purpose === 'SERVICE' ||
      latest?.status === 'OPTED_IN' ||
      (history.length === 0 && contact?.whatsappOptIn === true);
    return {
      eligible,
      reason: eligible ? null : 'Recorded consent is required before initiating a message',
      contactId: contact?.id,
    };
  }

  list(tenantId: string) {
    return this.records.find({ where: { tenantId }, order: { createdAt: 'DESC' }, take: 500 });
  }

  async getPreferences(tenantId: string, input: string) {
    const phone = this.normalizePhone(input);
    const contact = await this.findContact(tenantId, phone);
    if (!contact) throw new NotFoundException('Contact not found for this phone number');
    const fields: Record<string, unknown> = contact.customFields ?? {};
    return {
      phone,
      timezone: typeof fields.whatsappTimezone === 'string' ? fields.whatsappTimezone : null,
      preferredLanguage:
        typeof fields.whatsappPreferredLanguage === 'string'
          ? fields.whatsappPreferredLanguage
          : null,
      marketingEnabled: fields.whatsappMarketingEnabled !== false,
    };
  }

  async updatePreferences(tenantId: string, input: string, dto: UpdateWhatsappPreferencesDto) {
    const phone = this.normalizePhone(input);
    if (
      Object.keys(dto).some(
        (key) => !['timezone', 'preferredLanguage', 'marketingEnabled'].includes(key),
      )
    )
      throw new BadRequestException('Unknown customer preference');
    const preferences: Record<string, string | boolean | null> = {};
    if (dto.timezone !== undefined) {
      if (dto.timezone === null) preferences.whatsappTimezone = null;
      else {
        if (
          typeof dto.timezone !== 'string' ||
          dto.timezone.length > 100 ||
          !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+.-]+)*$/.test(dto.timezone)
        )
          throw new BadRequestException('Use a valid IANA timezone, such as Asia/Kolkata');
        try {
          preferences.whatsappTimezone = new Intl.DateTimeFormat('en', {
            timeZone: dto.timezone,
          }).resolvedOptions().timeZone;
        } catch {
          throw new BadRequestException('Use a valid IANA timezone, such as Asia/Kolkata');
        }
      }
    }
    if (dto.preferredLanguage !== undefined) {
      if (dto.preferredLanguage === null) preferences.whatsappPreferredLanguage = null;
      else {
        if (
          typeof dto.preferredLanguage !== 'string' ||
          !dto.preferredLanguage ||
          dto.preferredLanguage.length > 80
        )
          throw new BadRequestException('Use a valid language locale, such as en-IN or hi');
        try {
          preferences.whatsappPreferredLanguage = Intl.getCanonicalLocales(
            dto.preferredLanguage,
          )[0];
        } catch {
          throw new BadRequestException('Use a valid language locale, such as en-IN or hi');
        }
      }
    }
    if (dto.marketingEnabled !== undefined) {
      if (typeof dto.marketingEnabled !== 'boolean')
        throw new BadRequestException('Marketing preference must be true or false');
      preferences.whatsappMarketingEnabled = dto.marketingEnabled;
    }
    if (!Object.keys(preferences).length)
      throw new BadRequestException('Provide at least one customer preference');
    const contact = await this.findContact(tenantId, phone);
    if (!contact) throw new NotFoundException('Contact not found for this phone number');
    // Merge in PostgreSQL so unrelated custom fields survive concurrent preference edits.
    const result = await this.contacts
      .createQueryBuilder()
      .update(Contact)
      .set({
        customFields: () => "COALESCE(custom_fields, '{}'::jsonb) || CAST(:preferences AS jsonb)",
      })
      .where('tenant_id = :tenantId AND id = :contactId AND deleted_at IS NULL', {
        tenantId,
        contactId: contact.id,
      })
      .andWhere(
        "(regexp_replace(phone, '[^0-9]', '', 'g') = :phone OR regexp_replace(mobile, '[^0-9]', '', 'g') = :phone)",
        { phone },
      )
      .setParameter('preferences', JSON.stringify(preferences))
      .execute();
    if (!result.affected) throw new NotFoundException('Contact not found for this phone number');
    return this.getPreferences(tenantId, phone);
  }

  async record(tenantId: string, dto: RecordWhatsappConsentDto, actorId?: string) {
    const phone = this.normalizePhone(dto.phone);
    return this.records.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [tenantId + ':' + phone]);
      const contact = await manager
        .getRepository(Contact)
        .createQueryBuilder('c')
        .where('c.tenantId = :tenantId', { tenantId })
        .andWhere(
          "(regexp_replace(c.phone, '[^0-9]', '', 'g') = :phone OR regexp_replace(c.mobile, '[^0-9]', '', 'g') = :phone)",
          { phone },
        )
        .getOne();
      const scope = dto.status === 'OPTED_OUT' ? 'ALL' : (dto.scope ?? 'ALL');
      const record = await manager.getRepository(WhatsAppConsent).save(
        manager.create(WhatsAppConsent, {
          tenantId,
          phone,
          status: dto.status,
          scope,
          source: dto.source,
          evidence: dto.evidence,
          contactId: contact?.id,
          createdBy: actorId,
        }),
      );
      if (contact) {
        // An opt-in to a single purpose must never grant blanket marketing permission.
        if (dto.status === 'OPTED_OUT' || scope === 'ALL' || scope === 'MARKETING') {
          contact.whatsappOptIn = dto.status === 'OPTED_IN';
          await manager.save(contact);
        }
      }
      return record;
    });
  }
  suppress(tenantId: string, phone: string, source = 'inbound_keyword') {
    return this.record(tenantId, { phone, status: 'OPTED_OUT', source, scope: 'ALL' });
  }
}
