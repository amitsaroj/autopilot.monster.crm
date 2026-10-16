import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { WhatsAppConsent } from '../../database/entities/whatsapp-consent.entity';
import { Contact } from '../../database/entities/contact.entity';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import {
  ListWhatsappConsentDto,
  ListSuppressedWhatsappConsentDto,
  RecordWhatsappConsentDto,
  ReconsentWhatsappConsentDto,
  UpdateContactSuppressionDto,
  UpdateWhatsappPreferencesDto,
} from './dto/whatsapp-consent.dto';

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
    if (
      purpose === 'MARKETING' &&
      contact &&
      contact.customFields?.whatsappMarketingEnabled !== true
    ) {
      return {
        eligible: false,
        reason: 'Enable marketing in customer preferences before sending',
        contactId: contact.id,
      };
    }
    const [latest, suppressed, historyCount] = await Promise.all([
      this.records.findOne({
        where: { tenantId, phone, scope: In(['ALL', purpose]) },
        order: { createdAt: 'DESC', id: 'DESC' },
      }),
      this.records.findOne({
        where: { tenantId, phone, scope: 'ALL' },
        order: { createdAt: 'DESC', id: 'DESC' },
      }),
      this.records.count({ where: { tenantId, phone } }),
    ]);
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
      (historyCount === 0 && contact?.whatsappOptIn === true);
    return {
      eligible,
      reason: eligible ? null : 'Recorded consent is required before initiating a message',
      contactId: contact?.id,
    };
  }

  list(tenantId: string, filters: ListWhatsappConsentDto = {}) {
    const query = this.records
      .createQueryBuilder('consent')
      .where('consent.tenantId = :tenantId', { tenantId })
      .orderBy('consent.createdAt', 'DESC')
      .addOrderBy('consent.id', 'DESC')
      .take(filters.limit ?? 500);
    if (filters.status) query.andWhere('consent.status = :status', { status: filters.status });
    if (filters.scope) query.andWhere('consent.scope = :scope', { scope: filters.scope });
    if (filters.phone?.trim()) {
      const phone = filters.phone.replace(/\D/g, '');
      if (!phone) throw new BadRequestException('Enter at least one phone digit to search');
      query.andWhere("regexp_replace(consent.phone, '[^0-9]', '', 'g') LIKE :phone", {
        phone: `%${phone}%`,
      });
    }
    return query.getMany();
  }

  async listSuppressed(tenantId: string, pagination: ListSuppressedWhatsappConsentDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const newerGlobalConsent = this.records
      .createQueryBuilder('newer')
      .select('1')
      .where('newer.tenantId = consent.tenantId')
      .andWhere('newer.phone = consent.phone')
      .andWhere('newer.deletedAt IS NULL')
      .andWhere("newer.scope = 'ALL'")
      .andWhere(
        '(newer.createdAt > consent.createdAt OR (newer.createdAt = consent.createdAt AND newer.id > consent.id))',
      );
    const [items, total] = await this.records
      .createQueryBuilder('consent')
      .where('consent.tenantId = :tenantId', { tenantId })
      .andWhere("consent.scope = 'ALL' AND consent.status = 'OPTED_OUT'")
      .andWhere(`NOT EXISTS (${newerGlobalConsent.getQuery()})`)
      .orderBy('consent.createdAt', 'DESC')
      .addOrderBy('consent.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total, page, limit };
  }

  async updateContactSuppression(tenantId: string, dto: UpdateContactSuppressionDto) {
    const result = await this.contacts.update(
      { tenantId, id: In([...new Set(dto.contactIds)]), deletedAt: IsNull() },
      { doNotContact: dto.doNotContact },
    );
    return { updated: result.affected ?? 0 };
  }

  reconsent(
    tenantId: string,
    input: string,
    dto: ReconsentWhatsappConsentDto,
    actorId?: string,
  ) {
    if (!dto.evidence.trim()) throw new BadRequestException('Evidence is required for re-consent');
    return this.write(tenantId, input, 'OPTED_IN', dto.source, {
      scope: dto.scope,
      evidence: dto.evidence,
      actorId,
      confirmGlobalOptOutOverride: dto.confirmGlobalOptOutOverride,
    });
  }

  async getPreferences(tenantId: string, input: string) {
    const phone = this.normalizePhone(input);
    const contact = await this.findContact(tenantId, phone);
    if (!contact) throw new NotFoundException('Contact not found for this phone number');
    const fields: Record<string, unknown> = contact.customFields ?? {};
    const [latestMarketing, historyCount] = await Promise.all([
      this.records.findOne({
        where: { tenantId, phone, scope: In(['ALL', 'MARKETING']) },
        order: { createdAt: 'DESC', id: 'DESC' },
      }),
      this.records.count({ where: { tenantId, phone } }),
    ]);
    const marketingConsentStatus =
      latestMarketing?.status ??
      (historyCount === 0 && contact.whatsappOptIn ? 'OPTED_IN' : 'UNKNOWN');
    return {
      phone,
      timezone: typeof fields.whatsappTimezone === 'string' ? fields.whatsappTimezone : null,
      preferredLanguage:
        typeof fields.whatsappPreferredLanguage === 'string'
          ? fields.whatsappPreferredLanguage
          : null,
      // Preferences are not consent; unknown remains disabled in both the API and UI.
      marketingEnabled: fields.whatsappMarketingEnabled === true,
      marketingConsentStatus,
      suppressed: contact.doNotContact || marketingConsentStatus === 'OPTED_OUT',
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

  record(tenantId: string, dto: RecordWhatsappConsentDto, actorId?: string) {
    // A manually recorded opt-out always suppresses every purpose.
    const scope = dto.status === 'OPTED_OUT' ? 'ALL' : (dto.scope ?? 'ALL');
    return this.write(tenantId, dto.phone, dto.status, dto.source, {
      scope,
      evidence: dto.evidence,
      actorId,
    });
  }

  recordMany(tenantId: string, records: RecordWhatsappConsentDto[], actorId?: string) {
    if (records.some((record) => record.status === 'OPTED_IN' && !record.evidence?.trim()))
      throw new BadRequestException('Evidence is required for every imported opt-in');
    const normalized = records.map((record, index) => ({
      record,
      index,
      phone: this.normalizePhone(record.phone),
    }));
    if (new Set(normalized.map(({ phone }) => phone)).size !== normalized.length)
      throw new BadRequestException('The import contains duplicate phone numbers');

    return this.records.manager.transaction(async (manager) => {
      const saved: WhatsAppConsent[] = new Array(records.length);
      // A stable lock order prevents overlapping imports from deadlocking.
      for (const item of normalized.sort((a, b) => a.phone.localeCompare(b.phone))) {
        const scope = item.record.status === 'OPTED_OUT' ? 'ALL' : (item.record.scope ?? 'ALL');
        saved[item.index] = await this.writeWithManager(
          manager,
          tenantId,
          item.phone,
          item.record.status,
          item.record.source,
          { scope, evidence: item.record.evidence, actorId },
        );
      }
      return saved;
    });
  }

  /** Opt-out from a keyword (STOP), a Meta error (131050, scope MARKETING) or any system source. */
  recordOptOut(tenantId: string, phone: string, source: string, meta: ConsentMeta = {}) {
    return this.write(tenantId, phone, 'OPTED_OUT', source, meta);
  }

  /** Re-subscribe (START / SUBSCRIBE keyword) or any other recorded opt-in. */
  recordOptIn(tenantId: string, phone: string, source: string, meta: ConsentMeta = {}) {
    return this.write(tenantId, phone, 'OPTED_IN', source, {
      ...meta,
      confirmGlobalOptOutOverride: true,
    });
  }

  async applyInboundKeyword(
    tenantId: string,
    input: string,
    status: WhatsAppConsent['status'],
    messageSid: string,
  ): Promise<void> {
    const phone = this.normalizePhone(input);
    await this.records.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [tenantId + ':' + phone]);
      const messages = manager.getRepository(WhatsAppMessage);
      const message = await messages.findOne({
        where: { tenantId, messageSid, direction: 'INBOUND' },
      });
      if (!message || message.workflowDispatched) return;

      const records = manager.getRepository(WhatsAppConsent);
      const latest = await records.findOne({
        where: { tenantId, phone, scope: 'ALL' },
        order: { createdAt: 'DESC', id: 'DESC' },
      });
      if (latest?.source === 'inbound_keyword' && latest.evidence?.startsWith('inbound ')) {
        const previous = await messages.findOne({
          where: {
            tenantId,
            messageSid: latest.evidence.slice('inbound '.length),
            direction: 'INBOUND',
          },
        });
        if (
          previous?.providerTimestamp &&
          message.providerTimestamp &&
          previous.providerTimestamp >= message.providerTimestamp
        ) {
          await messages.update({ tenantId, id: message.id }, { workflowDispatched: true });
          return;
        }
      }

      if (status === 'OPTED_OUT' || latest?.status === 'OPTED_OUT') {
        await this.writeWithManager(manager, tenantId, phone, status, 'inbound_keyword', {
          scope: 'ALL',
          evidence: `inbound ${messageSid}`,
          confirmGlobalOptOutOverride: status === 'OPTED_IN',
        });
      }
      await messages.update({ tenantId, id: message.id }, { workflowDispatched: true });
    });
  }

  suppress(tenantId: string, phone: string, source = 'inbound_keyword') {
    return this.recordOptOut(tenantId, phone, source);
  }

  private write(
    tenantId: string,
    input: string,
    status: WhatsAppConsent['status'],
    source: string,
    { scope = 'ALL', evidence, actorId, confirmGlobalOptOutOverride }: ConsentMeta,
  ): Promise<WhatsAppConsent> {
    const phone = this.normalizePhone(input);
    return this.records.manager.transaction((manager) =>
      this.writeWithManager(manager, tenantId, phone, status, source, {
        scope,
        evidence,
        actorId,
        confirmGlobalOptOutOverride,
      }),
    );
  }

  private async writeWithManager(
    manager: EntityManager,
    tenantId: string,
    phone: string,
    status: WhatsAppConsent['status'],
    source: string,
    { scope = 'ALL', evidence, actorId, confirmGlobalOptOutOverride }: ConsentMeta,
  ): Promise<WhatsAppConsent> {
    await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [tenantId + ':' + phone]);
    if (status === 'OPTED_IN' && scope === 'ALL') {
      if (confirmGlobalOptOutOverride && !evidence?.trim()) {
        throw new BadRequestException('Evidence is required to confirm global re-consent');
      }
      if (!confirmGlobalOptOutOverride) {
        const latestGlobal = await manager.getRepository(WhatsAppConsent).findOne({
          where: { tenantId, phone, scope: 'ALL' },
          order: { createdAt: 'DESC', id: 'DESC' },
        });
        if (latestGlobal?.status === 'OPTED_OUT') {
          throw new BadRequestException(
            'A global opt-out requires explicit re-consent confirmation before it can be cleared',
          );
        }
      }
    }
    const contact = await manager
      .getRepository(Contact)
      .createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere(
        "(regexp_replace(c.phone, '[^0-9]', '', 'g') = :phone OR regexp_replace(c.mobile, '[^0-9]', '', 'g') = :phone)",
        { phone },
      )
      .getOne();
    const record = await manager.getRepository(WhatsAppConsent).save(
      manager.create(WhatsAppConsent, {
        tenantId,
        phone,
        status,
        scope,
        source: source.slice(0, 200),
        evidence,
        contactId: contact?.id,
        createdBy: actorId,
      }),
    );
    if (contact && (status === 'OPTED_OUT' || scope === 'ALL' || scope === 'MARKETING')) {
      // An opt-in to a single purpose must never grant blanket marketing permission.
      contact.whatsappOptIn = status === 'OPTED_IN';
      await manager.save(contact);
    }
    return record;
  }
}

export interface ConsentMeta {
  /** Defaults to ALL. */
  scope?: WhatsAppConsent['scope'];
  /** Free-text provenance, e.g. inbound message id or raw keyword. */
  evidence?: string;
  actorId?: string;
  confirmGlobalOptOutOverride?: boolean;
}
