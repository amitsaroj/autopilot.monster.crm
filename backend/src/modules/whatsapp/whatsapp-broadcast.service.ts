import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';
import { isUUID } from 'class-validator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  WhatsAppBroadcast,
  WhatsAppBroadcastApprovalStatus,
  WhatsAppBroadcastRecurrence,
  WhatsAppBroadcastStatus as Status,
} from '../../database/entities/whatsapp-broadcast.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Segment } from '../../database/entities/segment.entity';
import { WhatsAppTemplateStatus } from '../../database/entities/whatsapp-template.entity';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappAccountService } from './whatsapp-account.service';
import type { WhatsappBroadcastJobPayload } from './whatsapp-broadcast.processor';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import {
  CreateWhatsappBroadcastDto,
  ScheduleWhatsappBroadcastDto,
  isBroadcastJson,
} from './dto/whatsapp-broadcast.dto';

type RecurrenceSettings = Pick<
  CreateWhatsappBroadcastDto,
  'recurrenceFrequency' | 'recurrenceEndAt' | 'recurrenceMaxOccurrences'
>;

function validateRecurrence(settings: RecurrenceSettings, firstAt: Date): void {
  const {
    recurrenceFrequency: frequency,
    recurrenceEndAt: endAt,
    recurrenceMaxOccurrences: max,
  } = settings;
  if (!frequency) {
    if (endAt !== undefined || max !== undefined)
      throw new BadRequestException('A recurrence frequency is required');
    return;
  }
  if (max === undefined && endAt === undefined)
    throw new BadRequestException('Recurrence requires an end date or maximum occurrence count');
  if (max !== undefined && (!Number.isInteger(max) || max < 2 || max > 366))
    throw new BadRequestException('Recurrence count must be between 2 and 366 occurrences');
  if (endAt !== undefined) {
    const end = new Date(endAt);
    if (!Number.isFinite(end.getTime()) || end.getTime() <= firstAt.getTime())
      throw new BadRequestException('Recurrence end date must be after the first occurrence');
  }
}

function nextRecurrenceAt(at: Date, frequency: WhatsAppBroadcastRecurrence): Date {
  const next = new Date(at);
  next.setUTCDate(next.getUTCDate() + (frequency === WhatsAppBroadcastRecurrence.DAILY ? 1 : 7));
  return next;
}

/** In-flight claims older than this are treated as crashed sends (well above the 15s HTTP timeout). */
export const STALE_CLAIM_MS = 120000;

const timezoneFormatters = new Map<string, Intl.DateTimeFormat>();
function timezoneFormatter(timezone: string): Intl.DateTimeFormat {
  let formatter = timezoneFormatters.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    timezoneFormatters.set(timezone, formatter);
  }
  return formatter;
}

function localTimeDueAt(from: Date, time: string, timezone: string): Date {
  const [hour, minute] = time.split(':').map(Number);
  const formatter = timezoneFormatter(timezone);
  const partsAt = (instant: number) =>
    Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]));
  const local = partsAt(from.getTime());
  const date = new Date(Date.UTC(Number(local.year), Number(local.month) - 1, Number(local.day)));

  for (let day = 0; day < 3; day++) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const dayOfMonth = date.getUTCDate();
    const desired = Date.UTC(year, month, dayOfMonth, hour, minute);
    let candidate = desired;
    for (let pass = 0; pass < 3; pass++) {
      const observed = partsAt(candidate);
      const observedAsUtc = Date.UTC(
        Number(observed.year),
        Number(observed.month) - 1,
        Number(observed.day),
        Number(observed.hour),
        Number(observed.minute),
      );
      candidate += desired - observedAsUtc;
    }
    const resolved = partsAt(candidate);
    if (
      Number(resolved.year) === year &&
      Number(resolved.month) === month + 1 &&
      Number(resolved.day) === dayOfMonth &&
      Number(resolved.hour) === hour &&
      Number(resolved.minute) === minute &&
      candidate >= from.getTime()
    )
      return new Date(candidate);
    date.setUTCDate(date.getUTCDate() + 1);
  }
  throw new BadRequestException('Unable to resolve recipient local time for this timezone');
}

function recipientTimeZone(contact: Contact): string {
  const value: unknown = contact.customFields?.whatsappTimezone;
  if (typeof value === 'string') {
    try {
      timezoneFormatter(value);
      return value;
    } catch {
      // Invalid legacy preferences safely fall back to UTC.
    }
  }
  return 'UTC';
}

/** sent; failed = definite rejection (retryable by user); skipped = consent/suppression;
 * unknown = Meta may have accepted it, never resent automatically. */
export type RecipientOutcome = 'sent' | 'failed' | 'skipped' | 'unknown';

export interface RecipientClaim {
  payload: WhatsappBroadcastJobPayload;
  attempt: number;
  controlVersion: number;
  templateId: string;
  phoneNumberId: string | null;
  contactFilter: WhatsAppBroadcast['contactFilter'];
}

export type ClaimResult =
  | { state: 'claimed'; claim: RecipientClaim }
  | { state: 'busy'; retryAt: number }
  | { state: 'done' };

@Injectable()
export class WhatsappBroadcastService {
  constructor(
    @InjectRepository(WhatsAppBroadcast)
    private readonly broadcastRepository: Repository<WhatsAppBroadcast>,
    @InjectRepository(Contact) private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Segment) private readonly segmentRepository: Repository<Segment>,
    private readonly templateService: WhatsappTemplateService,
    private readonly accounts: WhatsappAccountService,
    @InjectQueue(QUEUE_NAMES.WHATSAPP)
    private readonly whatsappQueue: Queue<WhatsappBroadcastJobPayload>,
  ) {}

  async findAll(tenantId: string): Promise<WhatsAppBroadcast[]> {
    const broadcasts = await this.broadcastRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    await this.refreshStats(tenantId, broadcasts);
    return broadcasts;
  }
  // Read-time projection: provider message statuses are authoritative, including READ implying delivery.
  // Do not persist this snapshot over concurrently arriving webhook updates.
  private async refreshStats(tenantId: string, broadcasts: WhatsAppBroadcast[]): Promise<void> {
    if (!broadcasts.length) return;
    const rows: Array<{ broadcast_id: string; status: string; count: number }> =
      await this.broadcastRepository.query(
        `
      SELECT broadcast_id, status, COUNT(*)::int AS count FROM whatsapp_messages
      WHERE tenant_id=$1 AND broadcast_id = ANY($2::uuid[]) AND deleted_at IS NULL
        AND direction='OUTBOUND' AND status IN ('DELIVERED','READ')
        AND message_sid NOT LIKE 'pending_%' AND message_sid NOT LIKE 'local_%'
      GROUP BY broadcast_id, status`,
        [tenantId, broadcasts.map((b) => b.id)],
      );
    const counts = new Map<string, { delivered: number; read: number }>();
    for (const row of rows) {
      const count = counts.get(row.broadcast_id) ?? { delivered: 0, read: 0 };
      count.delivered += Number(row.count);
      if (row.status === 'READ') count.read += Number(row.count);
      counts.set(row.broadcast_id, count);
    }
    for (const b of broadcasts) {
      b.delivered = counts.get(b.id)?.delivered ?? 0;
      b.read = counts.get(b.id)?.read ?? 0;
    }
  }
  async findOne(tenantId: string, id: string): Promise<WhatsAppBroadcast> {
    const b = await this.broadcastRepository.findOne({ where: { tenantId, id } });
    if (!b) throw new NotFoundException('Broadcast not found');
    await this.refreshStats(tenantId, [b]);
    return b;
  }
  async recipients(tenantId: string, id: string, after?: string) {
    await this.findOne(tenantId, id);
    if (after && !isUUID(after)) throw new BadRequestException('Invalid recipient cursor');
    const items: Array<{
      contactId: string;
      phone: string;
      outcome: string | null;
      error: string | null;
      messageId: string | null;
    }> = await this.broadcastRepository.query(
      `SELECT contact_id AS "contactId",payload->>'phone' AS phone,outcome,error,message_id AS "messageId" FROM whatsapp_broadcast_recipients WHERE tenant_id=$1 AND broadcast_id=$2 AND ($3::uuid IS NULL OR contact_id > $3::uuid) ORDER BY contact_id LIMIT 101`,
      [tenantId, id, after ?? null],
    );
    const hasMore = items.length > 100;
    if (hasMore) items.pop();
    return { items, nextCursor: hasMore ? items[items.length - 1].contactId : null };
  }
  async assertRecipientExportable(tenantId: string, id: string): Promise<string> {
    const broadcast = await this.findOne(tenantId, id);
    if (!broadcast.audiencePrepared)
      throw new BadRequestException('Prepare the campaign audience before exporting recipients');
    return broadcast.name;
  }
  async *streamRecipientCsv(tenantId: string, id: string): AsyncGenerator<string> {
    const cell = (value: unknown) => {
      const text = String(value ?? '');
      return `"${(/^[=+@-]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
    };
    yield ['Contact ID', 'Phone', 'Outcome', 'Message ID', 'Error'].map(cell).join(',') + '\r\n';
    let after: string | null = null;
    for (;;) {
      const rows: Array<{
        contactId: string;
        phone: string | null;
        outcome: string | null;
        error: string | null;
        messageId: string | null;
      }> = await this.broadcastRepository.query(
        `SELECT contact_id AS "contactId",payload->>'phone' AS phone,outcome,error,message_id AS "messageId"
         FROM whatsapp_broadcast_recipients
         WHERE tenant_id=$1 AND broadcast_id=$2 AND ($3::uuid IS NULL OR contact_id > $3::uuid)
         ORDER BY contact_id LIMIT 500`,
        [tenantId, id, after],
      );
      if (!rows.length) return;
      for (const row of rows) {
        yield [row.contactId, row.phone, row.outcome ?? 'Pending', row.messageId, row.error]
          .map(cell)
          .join(',') + '\r\n';
      }
      after = rows[rows.length - 1].contactId;
    }
  }
  async duplicate(tenantId: string, id: string) {
    const original = await this.findOne(tenantId, id);
    return this.create(tenantId, {
      name: `${original.name.slice(0, 245)} (copy)`,
      templateId: original.templateId,
      phoneNumberId: original.phoneNumberId,
      templateVariables: original.templateVariables,
      templateComponents: original.templateComponents,
      contactFilter: original.contactFilter,
    });
  }
  failPreparation(tenantId: string, id: string, reason: string) {
    return this.locked(tenantId, id, async (broadcast, manager) => {
      const recurring = Boolean(broadcast.recurrenceFrequency || broadcast.recurrenceSeriesId);
      if (
        (broadcast.audiencePrepared && !recurring) ||
        ![Status.SENDING, Status.SCHEDULED].includes(broadcast.status)
      )
        return;
      broadcast.status = Status.FAILED;
      broadcast.lastError = reason.slice(0, 1000);
      if (broadcast.recurrenceFrequency || broadcast.recurrenceSeriesId) {
        const seriesId = broadcast.recurrenceSeriesId ?? broadcast.id;
        const root = await manager.getRepository(WhatsAppBroadcast).findOne({
          where: { tenantId, id: seriesId },
          lock: { mode: 'pessimistic_write' },
        });
        if (root) {
          root.recurrenceState = 'FAILED';
          if ([Status.SENDING, Status.SCHEDULED, Status.PAUSED].includes(root.status))
            root.status = Status.FAILED;
          await manager.save(root);
        }
      }
      await manager.save(broadcast);
    });
  }
  async approvedTemplate(tenantId: string, id: string) {
    const t = await this.templateService.findOne(tenantId, id);
    if (t.status !== WhatsAppTemplateStatus.APPROVED || !t.waTemplateId?.trim()) {
      throw new BadRequestException('Broadcast requires an approved Meta-backed template');
    }
    return t;
  }
  requestApproval(tenantId: string, id: string, requesterId: string) {
    return this.locked(tenantId, id, async (broadcast, manager) => {
      if (broadcast.status !== Status.DRAFT)
        throw new BadRequestException('Only a draft broadcast can be submitted for review');
      if (broadcast.approvalStatus === WhatsAppBroadcastApprovalStatus.PENDING)
        throw new BadRequestException('Broadcast is already awaiting review');
      broadcast.approvalRequired = true;
      broadcast.approvalStatus = WhatsAppBroadcastApprovalStatus.PENDING;
      broadcast.approvalRequestedBy = requesterId;
      broadcast.approvalReviewedBy = null;
      broadcast.approvalReviewedAt = null;
      broadcast.approvalNote = null;
      return manager.save(broadcast);
    });
  }
  reviewApproval(
    tenantId: string,
    id: string,
    reviewerId: string,
    roles: string[],
    decision: WhatsAppBroadcastApprovalStatus.APPROVED | WhatsAppBroadcastApprovalStatus.REJECTED,
    note?: string,
  ) {
    if (!roles.includes('TENANT_ADMIN'))
      throw new ForbiddenException('Only a tenant owner or admin can review broadcasts');
    return this.locked(tenantId, id, async (broadcast, manager) => {
      if (
        !broadcast.approvalRequired ||
        broadcast.approvalStatus !== WhatsAppBroadcastApprovalStatus.PENDING
      )
        throw new BadRequestException('Broadcast is not awaiting review');
      if (broadcast.approvalRequestedBy === reviewerId)
        throw new ForbiddenException('The campaign requester cannot review their own broadcast');
      broadcast.approvalStatus = decision;
      broadcast.approvalReviewedBy = reviewerId;
      broadcast.approvalReviewedAt = new Date();
      broadcast.approvalNote = note?.trim() || null;
      return manager.save(broadcast);
    });
  }
  async create(tenantId: string, dto: CreateWhatsappBroadcastDto): Promise<WhatsAppBroadcast> {
    for (const property of ['templateVariables', 'templateComponents', 'contactFilter'] as const) {
      if (dto[property] !== undefined && !isBroadcastJson(dto[property], property))
        throw new BadRequestException(`Invalid ${property}`);
    }
    if (dto.recurrenceFrequency || dto.recurrenceEndAt || dto.recurrenceMaxOccurrences) {
      if (!dto.scheduledAt)
        throw new BadRequestException('Recurring broadcasts require an initial scheduled date');
      validateRecurrence(dto, new Date(dto.scheduledAt));
    }
    const credentials = await this.accounts.getCredentials(tenantId, dto.phoneNumberId);
    const template = await this.approvedTemplate(tenantId, dto.templateId);
    this.sendComponents(
      template.components,
      dto.templateComponents ?? [],
      dto.templateVariables ?? {},
    );
    const b = await this.broadcastRepository.save(
      this.broadcastRepository.create({
        tenantId,
        name: dto.name,
        templateId: dto.templateId,
        phoneNumberId: credentials.phoneNumberId,
        templateVariables: dto.templateVariables ?? {},
        templateComponents: dto.templateComponents ?? [],
        contactFilter: dto.contactFilter ?? {},
        recipientLocalTime: dto.recipientLocalTime ?? null,
        recurrenceFrequency: dto.recurrenceFrequency ?? null,
        recurrenceEndAt: dto.recurrenceEndAt ? new Date(dto.recurrenceEndAt) : null,
        recurrenceMaxOccurrences: dto.recurrenceMaxOccurrences ?? null,
        status: Status.DRAFT,
      }),
    );
    return dto.scheduledAt
      ? this.schedule(tenantId, b.id, {
          scheduledAt: dto.scheduledAt,
          recipientLocalTime: dto.recipientLocalTime,
          recurrenceFrequency: dto.recurrenceFrequency,
          recurrenceEndAt: dto.recurrenceEndAt,
          recurrenceMaxOccurrences: dto.recurrenceMaxOccurrences,
        })
      : b;
  }
  async preview(tenantId: string, id: string) {
    const b = await this.findOne(tenantId, id);
    await this.accounts.getCredentials(tenantId, b.phoneNumberId);
    const template = await this.approvedTemplate(tenantId, b.templateId);
    this.sendComponents(template.components, b.templateComponents, b.templateVariables);
    const audience = await this.audience(tenantId, b.contactFilter);
    const recipientCount = await audience.clone().getCount();
    const eligible = await this.uniqueRecipients(
      this.eligible(audience.clone(), template.category),
      b.contactFilter.frequencyCap,
    );
    const limitExceeded =
      b.contactFilter.maxRecipients !== undefined && eligible > b.contactFilter.maxRecipients;
    return {
      recipientCount,
      eligible,
      blocked: recipientCount - eligible,
      limitExceeded,
      maxRecipients: b.contactFilter.maxRecipients ?? null,
    };
  }
  private capped(
    q: ReturnType<Repository<Contact>['createQueryBuilder']>,
    cap?: WhatsAppBroadcast['contactFilter']['frequencyCap'],
  ) {
    const phone =
      "regexp_replace(COALESCE(NULLIF(TRIM(c.mobile), ''), NULLIF(TRIM(c.phone), '')), '[^0-9]', '', 'g')";
    if (cap)
      q.andWhere(
        `(SELECT COUNT(*) FROM whatsapp_messages recent WHERE recent.tenant_id=c.tenant_id AND recent."to"=${phone} AND recent.direction='OUTBOUND' AND recent.broadcast_id IS NOT NULL AND recent.deleted_at IS NULL AND recent.status <> 'FAILED' AND recent.created_at > :since) < :cap`,
        { since: new Date(Date.now() - cap.windowHours * 3600000), cap: cap.maxMessages },
      );
    return q;
  }
  private async uniqueRecipients(
    q: ReturnType<Repository<Contact>['createQueryBuilder']>,
    cap?: WhatsAppBroadcast['contactFilter']['frequencyCap'],
  ) {
    const phone =
      "regexp_replace(COALESCE(NULLIF(TRIM(c.mobile), ''), NULLIF(TRIM(c.phone), '')), '[^0-9]', '', 'g')";
    this.capped(q, cap);
    const count = await q
      .select(`COUNT(DISTINCT ${phone})`, 'count')
      .getRawOne<{ count: string }>();
    return Number(count?.count ?? 0);
  }
  private eligible(q: ReturnType<Repository<Contact>['createQueryBuilder']>, purpose: string) {
    const phone =
      "regexp_replace(COALESCE(NULLIF(TRIM(c.mobile), ''), NULLIF(TRIM(c.phone), '')), '[^0-9]', '', 'g')";
    const history = `SELECT wc.status FROM whatsapp_consents wc WHERE wc.tenant_id=c.tenant_id
      AND wc.phone=${phone} AND wc.deleted_at IS NULL`;
    const eligible = q
      .andWhere('c.doNotContact = false')
      .andWhere("COALESCE(NULLIF(TRIM(c.mobile), ''), NULLIF(TRIM(c.phone), '')) ~ :phoneSyntax", {
        phoneSyntax: '^[+]?[1-9][0-9[:space:]().-]{7,25}$',
      })
      .andWhere(`${phone} ~ '^[1-9][0-9]{7,14}$'`)
      .andWhere(
        `NOT EXISTS (SELECT 1 FROM (${history} AND wc.scope='ALL'
        ORDER BY wc.created_at DESC,wc.id DESC LIMIT 1) suppression WHERE suppression.status='OPTED_OUT')`,
      )
      .andWhere(
        `((${history} AND wc.scope IN ('ALL', :consentPurpose)
        ORDER BY wc.created_at DESC,wc.id DESC LIMIT 1) = 'OPTED_IN'
        OR (NOT EXISTS (${history}) AND c.whatsappOptIn=true))`,
        { consentPurpose: purpose },
      );
    if (purpose === 'MARKETING')
      eligible.andWhere("c.custom_fields ->> 'whatsappMarketingEnabled' = 'true'");
    return eligible;
  }
  private async audience(tenantId: string, filter: WhatsAppBroadcast['contactFilter']) {
    const q = this.contactRepository
      .createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId });
    if (filter.status?.length)
      q.andWhere('c.status IN (:...statuses)', { statuses: filter.status });
    const tags = new Set(filter.tags ?? []);
    if (filter.segmentIds?.length) {
      const segments = await this.segmentRepository.find({
        where: { tenantId, id: In(filter.segmentIds) },
      });
      if (segments.length !== new Set(filter.segmentIds).size)
        throw new BadRequestException('Unknown segment');
      for (const segment of segments) {
        if (!['CONTACT', 'LEAD'].includes(segment.entityType))
          throw new BadRequestException('Segment is not a contact audience');
        const operator = segment.rules?.operator ?? 'AND';
        if (!['AND', 'OR'].includes(operator))
          throw new BadRequestException('Unsupported segment operator');
        const conditions = segment.rules?.conditions as
          | Array<{ field?: string; value?: unknown; operator?: string }>
          | undefined;
        const clauses: string[] = [];
        if (!conditions?.length)
          throw new BadRequestException('Empty segment rules are not supported');
        for (const rule of conditions) {
          if (
            !['tag', 'tags'].includes(rule.field ?? '') ||
            typeof rule.value !== 'string' ||
            (rule.operator && !['equals', 'contains', 'eq'].includes(rule.operator))
          ) {
            throw new BadRequestException(
              'Unsupported segment rules; cannot safely resolve audience',
            );
          }
          const parameter = `segmentTag${segment.id.replace(/-/g, '')}${clauses.length}`;
          clauses.push(`:${parameter} = ANY(c.tags)`);
          q.setParameter(parameter, rule.value);
        }
        q.andWhere(`(${clauses.join(` ${operator} `)})`);
      }
    }
    if (tags.size) q.andWhere('c.tags && CAST(:tags AS text[])', { tags: [...tags] });
    if (filter.customField) q.andWhere('c.customFields ->> :key = :value', filter.customField);
    if (filter.excludeTags?.length)
      q.andWhere('NOT (c.tags && CAST(:excludeTags AS text[]))', {
        excludeTags: filter.excludeTags,
      });
    if (filter.excludeContactIds?.length)
      q.andWhere('c.id NOT IN (:...excludeContactIds)', {
        excludeContactIds: filter.excludeContactIds,
      });
    return q;
  }
  private sendComponents(
    definition: Record<string, unknown>,
    supplied: unknown[],
    variables: Record<string, string>,
  ): unknown[] {
    if (
      !isBroadcastJson(supplied, 'templateComponents') ||
      !isBroadcastJson(variables, 'templateVariables')
    )
      throw new BadRequestException('Invalid template send parameters');
    const definitions = Array.isArray(definition) ? definition : definition.components;
    if (!Array.isArray(definitions))
      throw new BadRequestException('Template component definition is missing');
    const result = supplied.length
      ? supplied
      : definitions.flatMap((raw: { type?: string; text?: string }) => {
          const slots = [...new Set((raw.text ?? '').match(/\{\{\d+\}\}/g) ?? [])].sort(
            (a, b) => Number(a.slice(2, -2)) - Number(b.slice(2, -2)),
          );
          if (!slots.length) return [];
          return [
            {
              type: raw.type?.toLowerCase(),
              parameters: slots.map((slot) => {
                const key = slot.slice(2, -2);
                const scopedKey = `${raw.type?.toLowerCase()}.${key}`;
                const value = variables[scopedKey] ?? variables[key];
                if (typeof value !== 'string')
                  throw new BadRequestException(`Supply template parameter ${key}`);
                return { type: 'text', text: value };
              }),
            },
          ];
        });
    for (const component of result) {
      if (
        !component ||
        typeof component !== 'object' ||
        !('type' in component) ||
        !('parameters' in component) ||
        !Array.isArray(component.parameters)
      ) {
        throw new BadRequestException('Invalid template send component');
      }
    }
    for (const raw of definitions) {
      const type = String(raw.type ?? '').toLowerCase();
      const slots = new Set(String(raw.text ?? '').match(/\{\{\d+\}\}/g) ?? []).size;
      if (type === 'header' && raw.format && raw.format !== 'TEXT') {
        if (!result.some((c) => (c as { type?: string }).type === type))
          throw new BadRequestException('Supply media header parameters');
      }
      if (slots) {
        const matching = result.filter((c) => (c as { type?: string }).type === type);
        if (
          matching.length !== 1 ||
          (matching[0] as { parameters: unknown[] }).parameters.length !== slots
        ) {
          throw new BadRequestException(`Template ${type} parameter count mismatch`);
        }
      }
    }
    return result;
  }
  async locked<T>(
    tenantId: string,
    id: string,
    fn: (b: WhatsAppBroadcast, m: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.broadcastRepository.manager.transaction(async (m) => {
      const b = await m
        .getRepository(WhatsAppBroadcast)
        .findOne({ where: { tenantId, id }, lock: { mode: 'pessimistic_write' } });
      if (!b) throw new NotFoundException('Broadcast not found');
      return fn(b, m);
    });
  }
  private async activate(
    tenantId: string,
    id: string,
    scheduledAt?: Date,
    resume = false,
    recipientLocalTime?: string | null,
    recurrence?: RecurrenceSettings,
  ) {
    const current = await this.findOne(tenantId, id);
    await this.approvedTemplate(tenantId, current.templateId);
    if (!resume && (await this.preview(tenantId, id)).limitExceeded)
      throw new BadRequestException(
        'Eligible audience exceeds the configured recipient limit; narrow the audience before starting',
      );
    const credentials = await this.accounts.getCredentials(tenantId, current.phoneNumberId);
    if (!resume && scheduledAt && recurrence) validateRecurrence(recurrence, scheduledAt);
    return this.locked(tenantId, id, async (b, m) => {
      if (!(resume ? [Status.PAUSED] : [Status.DRAFT, Status.SCHEDULED]).includes(b.status)) {
        throw new BadRequestException('Invalid broadcast transition');
      }
      if (b.approvalRequired && b.approvalStatus !== WhatsAppBroadcastApprovalStatus.APPROVED)
        throw new BadRequestException(
          'This broadcast must be approved before sending or scheduling',
        );
      b.phoneNumberId = credentials.phoneNumberId;
      b.lastError = null;
      b.status = scheduledAt ? Status.SCHEDULED : Status.SENDING;
      b.scheduledAt = scheduledAt;
      if (!resume && recipientLocalTime !== undefined) b.recipientLocalTime = recipientLocalTime;
      if (!resume && scheduledAt && recurrence) {
        b.recurrenceFrequency = recurrence.recurrenceFrequency ?? null;
        b.recurrenceEndAt = recurrence.recurrenceEndAt
          ? new Date(recurrence.recurrenceEndAt)
          : null;
        b.recurrenceMaxOccurrences = recurrence.recurrenceMaxOccurrences ?? null;
        b.recurrenceOccurrence = 1;
        b.recurrenceSeriesId = null;
        b.recurrenceState = recurrence.recurrenceFrequency ? 'ACTIVE' : null;
      }
      b.controlVersion++;
      if (resume && (b.recurrenceFrequency || b.recurrenceSeriesId)) {
        const seriesId = b.recurrenceSeriesId ?? b.id;
        const root = await m.getRepository(WhatsAppBroadcast).findOne({
          where: { tenantId, id: seriesId },
          lock: { mode: 'pessimistic_write' },
        });
        if (root?.recurrenceState === 'PAUSED') {
          root.recurrenceState = 'ACTIVE';
          if (root.status === Status.PAUSED)
            root.status = root.audiencePrepared ? Status.SENDING : Status.SCHEDULED;
          root.controlVersion++;
        }
        if (root) await m.save(root);
      }
      // Queue publication precedes commit: workers lock the same row before acting.
      await this.whatsappQueue.add(
        'broadcast-start',
        { tenantId, broadcastId: id, phoneNumberId: b.phoneNumberId },
        {
          jobId: `broadcast-start-${id}-${b.controlVersion}`,
          delay: Math.max(0, (scheduledAt?.getTime() ?? Date.now()) - Date.now()),
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: false,
        },
      );
      if (resume && (b.recurrenceFrequency || b.recurrenceSeriesId)) {
        const seriesId = b.recurrenceSeriesId ?? b.id;
        const pending: WhatsAppBroadcast[] = await m
          .getRepository(WhatsAppBroadcast)
          .createQueryBuilder('occurrence')
          .where('occurrence.tenantId = :tenantId', { tenantId })
          .andWhere('occurrence.id <> :currentId', { currentId: b.id })
          .andWhere('(occurrence.id = :seriesId OR occurrence.recurrenceSeriesId = :seriesId)', {
            seriesId,
          })
          .andWhere('occurrence.status IN (:...statuses)', {
            statuses: [Status.SCHEDULED, Status.SENDING, Status.PAUSED],
          })
          .getMany();
        for (const occurrence of pending) {
          occurrence.status = occurrence.audiencePrepared ? Status.SENDING : Status.SCHEDULED;
          occurrence.controlVersion++;
          await m.save(occurrence);
          await this.whatsappQueue.add(
            'broadcast-start',
            { tenantId, broadcastId: occurrence.id, phoneNumberId: occurrence.phoneNumberId },
            {
              jobId: `broadcast-start-${occurrence.id}-${occurrence.controlVersion}`,
              delay: Math.max(0, (occurrence.scheduledAt?.getTime() ?? Date.now()) - Date.now()),
              attempts: 5,
              backoff: { type: 'exponential', delay: 5000 },
              removeOnComplete: false,
            },
          );
        }
      }
      return m.save(b);
    });
  }
  schedule(tenantId: string, id: string, dto: ScheduleWhatsappBroadcastDto) {
    const at = new Date(dto.scheduledAt);
    if (!Number.isFinite(at.getTime()) || at.getTime() <= Date.now())
      throw new BadRequestException('Schedule must be in the future');
    return this.activate(tenantId, id, at, false, dto.recipientLocalTime, dto);
  }
  send(tenantId: string, id: string) {
    return this.activate(tenantId, id);
  }
  resume(tenantId: string, id: string) {
    return this.activate(tenantId, id, undefined, true);
  }
  pause(tenantId: string, id: string) {
    return this.control(tenantId, id, Status.PAUSED);
  }
  cancel(tenantId: string, id: string) {
    return this.control(tenantId, id, Status.CANCELLED);
  }
  private async control(tenantId: string, id: string, status: Status) {
    let seriesId: string | null = null;
    const result = await this.locked(tenantId, id, async (b, m) => {
      const allowed =
        status === Status.PAUSED
          ? [Status.SCHEDULED, Status.SENDING]
          : [Status.DRAFT, Status.SCHEDULED, Status.SENDING, Status.PAUSED];
      if (!allowed.includes(b.status))
        throw new BadRequestException('Invalid broadcast transition');
      b.status = status;
      b.controlVersion++;
      if (b.recurrenceFrequency || b.recurrenceSeriesId) {
        seriesId = b.recurrenceSeriesId ?? b.id;
        const repository = m.getRepository(WhatsAppBroadcast);
        const root = await repository.findOne({
          where: { tenantId, id: seriesId },
          lock: { mode: 'pessimistic_write' },
        });
        if (root) {
          root.recurrenceState = status === Status.PAUSED ? 'PAUSED' : 'CANCELLED';
          if ([Status.SCHEDULED, Status.SENDING].includes(root.status)) root.status = status;
          await m.save(root);
        }
      }
      return m.save(b);
    });
    if (seriesId) {
      const nextState = status === Status.PAUSED ? 'PAUSED' : 'CANCELLED';
      const occurrenceStatuses =
        status === Status.PAUSED
          ? [Status.SCHEDULED, Status.SENDING]
          : [Status.SCHEDULED, Status.SENDING, Status.PAUSED];
      await this.broadcastRepository.query(
        `UPDATE whatsapp_broadcasts occurrence SET status=$3, control_version=control_version+1
         WHERE occurrence.tenant_id=$1 AND occurrence.id<>$2
           AND (occurrence.id=$4 OR occurrence.recurrence_series_id=$4)
           AND occurrence.status::text=ANY($5::text[])
           AND EXISTS (SELECT 1 FROM whatsapp_broadcasts series WHERE series.tenant_id=$1
             AND series.id=$4 AND series.recurrence_state=$6)`,
        [tenantId, id, status, seriesId, occurrenceStatuses, nextState],
      );
    }
    return result;
  }
  async prepare(tenantId: string, id: string) {
    await this.locked(tenantId, id, async (b, m) => {
      if (![Status.SCHEDULED, Status.SENDING].includes(b.status)) return;
      if (b.approvalRequired && b.approvalStatus !== WhatsAppBroadcastApprovalStatus.APPROVED)
        return;
      if (b.scheduledAt && b.scheduledAt.getTime() > Date.now()) return;
      const seriesId = b.recurrenceSeriesId ?? (b.recurrenceFrequency ? b.id : null);
      let seriesRoot: WhatsAppBroadcast | null = null;
      if (seriesId) {
        seriesRoot = await m.getRepository(WhatsAppBroadcast).findOne({
          where: { tenantId, id: seriesId },
          lock: { mode: 'pessimistic_write' },
        });
        if (
          !seriesRoot ||
          (seriesRoot.approvalRequired &&
            seriesRoot.approvalStatus !== WhatsAppBroadcastApprovalStatus.APPROVED) ||
          ['PAUSED', 'CANCELLED', 'FAILED'].includes(seriesRoot.recurrenceState ?? '')
        )
          return;
      }
      const t = await this.approvedTemplate(tenantId, b.templateId);
      const credentials = await this.accounts.getCredentials(tenantId, b.phoneNumberId);
      b.phoneNumberId = credentials.phoneNumberId;
      b.status = Status.SENDING;
      if (!b.audiencePrepared) {
        const q = this.capped(
          this.eligible(await this.audience(tenantId, b.contactFilter), t.category),
          b.contactFilter.frequencyCap,
        );
        q.setQueryRunner(m.queryRunner!);
        if (
          b.contactFilter.maxRecipients !== undefined &&
          (await this.uniqueRecipients(q.clone())) > b.contactFilter.maxRecipients
        )
          throw new BadRequestException(
            'Audience grew beyond the recipient limit; no messages were queued',
          );
        let after = '';
        for (;;) {
          const page = await q
            .clone()
            .andWhere(after ? 'c.id > :after' : 'true', { after })
            .orderBy('c.id')
            .take(250)
            .getMany();
          if (!page.length) break;
          for (const c of page) {
            const replacements: Record<string, string> = {
              ...b.templateVariables,
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
            };
            const interpolate = (v: unknown): unknown => {
              if (typeof v === 'string')
                return v.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
                  if (replacements[k] === undefined)
                    throw new BadRequestException(`Missing template variable ${k}`);
                  return replacements[k];
                });
              if (Array.isArray(v)) return v.map(interpolate);
              if (v && typeof v === 'object')
                return Object.fromEntries(
                  Object.entries(v).map(([k, value]) => [k, interpolate(value)]),
                );
              return v;
            };
            const components = interpolate(
              this.sendComponents(t.components, b.templateComponents, b.templateVariables),
            );
            if (!Array.isArray(components))
              throw new BadRequestException('Invalid interpolated template components');
            const payload: WhatsappBroadcastJobPayload = {
              tenantId,
              broadcastId: id,
              contactId: c.id,
              phoneNumberId: b.phoneNumberId,
              phone: c.mobile?.trim() || c.phone?.trim(),
              templateName: t.name,
              language: t.language,
              components,
            };
            if (b.recipientLocalTime && b.scheduledAt) {
              const dueAt = localTimeDueAt(
                b.scheduledAt,
                b.recipientLocalTime,
                recipientTimeZone(c),
              );
              payload['recipientSendAt'] = dueAt.toISOString();
            }
            await m.query(
              `INSERT INTO whatsapp_broadcast_recipients (tenant_id,broadcast_id,contact_id,payload) SELECT $1,$2,$3,$4::jsonb WHERE NOT EXISTS (SELECT 1 FROM whatsapp_broadcast_recipients existing WHERE existing.tenant_id=$1 AND existing.broadcast_id=$2 AND regexp_replace(existing.payload->>'phone', '[^0-9]', '', 'g')=regexp_replace($4::jsonb->>'phone', '[^0-9]', '', 'g')) ON CONFLICT DO NOTHING`,
              [tenantId, id, c.id, JSON.stringify(payload)],
            );
          }
          after = page[page.length - 1].id;
        }
        const [count] = await m.query(
          `SELECT COUNT(*)::int AS total FROM whatsapp_broadcast_recipients WHERE tenant_id=$1 AND broadcast_id=$2`,
          [tenantId, id],
        );
        b.total = count.total;
        b.audiencePrepared = true;
        if (!b.total) b.status = Status.COMPLETED;
      }
      if (
        seriesRoot?.recurrenceFrequency &&
        seriesRoot.recurrenceState === 'ACTIVE' &&
        b.scheduledAt
      ) {
        const nextIndex = b.recurrenceOccurrence + 1;
        const nextAt = nextRecurrenceAt(b.scheduledAt, seriesRoot.recurrenceFrequency);
        const withinCount =
          seriesRoot.recurrenceMaxOccurrences === null ||
          seriesRoot.recurrenceMaxOccurrences === undefined ||
          nextIndex <= seriesRoot.recurrenceMaxOccurrences;
        const withinEnd =
          seriesRoot.recurrenceEndAt === null ||
          seriesRoot.recurrenceEndAt === undefined ||
          nextAt.getTime() <= seriesRoot.recurrenceEndAt.getTime();
        if (withinCount && withinEnd) {
          const occurrence = m.getRepository(WhatsAppBroadcast).create({
            tenantId,
            name: `${seriesRoot.name.slice(0, 235)} (${nextIndex})`,
            templateId: seriesRoot.templateId,
            phoneNumberId: seriesRoot.phoneNumberId,
            templateVariables: seriesRoot.templateVariables,
            contactFilter: seriesRoot.contactFilter,
            templateComponents: seriesRoot.templateComponents,
            recipientLocalTime: seriesRoot.recipientLocalTime,
            scheduledAt: nextAt,
            status: Status.SCHEDULED,
            recurrenceSeriesId: seriesId,
            recurrenceOccurrence: nextIndex,
            recurrenceFrequency: null,
            recurrenceState: null,
          });
          const [created]: Array<{ id: string; phone_number_id: string | null }> = await m.query(
            `INSERT INTO whatsapp_broadcasts
              (tenant_id,name,template_id,phone_number_id,template_variables,contact_filter,template_components,
               recipient_local_time,scheduled_at,status,recurrence_series_id,recurrence_occurrence,created_by,updated_by)
             VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8,$9,'SCHEDULED',$10,$11,$12,$12)
             ON CONFLICT (tenant_id,recurrence_series_id,recurrence_occurrence) WHERE recurrence_series_id IS NOT NULL
             DO NOTHING RETURNING *`,
            [
              tenantId,
              occurrence.name,
              occurrence.templateId,
              occurrence.phoneNumberId,
              JSON.stringify(occurrence.templateVariables),
              JSON.stringify(occurrence.contactFilter),
              JSON.stringify(occurrence.templateComponents),
              occurrence.recipientLocalTime ?? null,
              nextAt,
              seriesId,
              nextIndex,
              b.createdBy ?? null,
            ],
          );
          if (created)
            await this.whatsappQueue.add(
              'broadcast-start',
              {
                tenantId,
                broadcastId: created.id,
                phoneNumberId: created.phone_number_id ?? undefined,
              },
              {
                jobId: `broadcast-start-${created.id}-1`,
                delay: Math.max(0, nextAt.getTime() - Date.now()),
                attempts: 5,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: false,
              },
            );
        } else seriesRoot.recurrenceState = 'COMPLETED';
        await m.save(seriesRoot);
      }
      await m.save(b);
    });
    // Bounded recovery scan. Re-running a start job re-publishes the same stable recipient IDs.
    let after = '';
    for (;;) {
      const rows: Array<{ contact_id: string; payload: WhatsappBroadcastJobPayload }> =
        await this.broadcastRepository.query(
          `SELECT contact_id, payload FROM whatsapp_broadcast_recipients WHERE tenant_id=$1 AND broadcast_id=$2 AND (outcome IS NULL OR outcome='sending') AND contact_id::text > $3 ORDER BY contact_id LIMIT 250`,
          [tenantId, id, after],
        );
      if (!rows.length) break;
      for (const row of rows) {
        const jobId = `broadcast-${id}-${row.contact_id}`;
        const existing = await this.whatsappQueue.getJob(jobId);
        if (existing && ['completed', 'failed'].includes(await existing.getState()))
          await existing.remove();
        await this.whatsappQueue.add('broadcast-message', row.payload, {
          jobId,
          delay: row.payload?.recipientSendAt
            ? Math.max(0, new Date(row.payload.recipientSendAt).getTime() - Date.now())
            : 0,
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: false,
        });
      }
      after = rows[rows.length - 1].contact_id;
    }
  }
  async deferRecipient(payload: WhatsappBroadcastJobPayload, dueAt: number): Promise<void> {
    // Bull v4 completes a processor's returned promise automatically; moving its active job
    // to delayed manually would still trigger moveToCompleted. Publish a durable successor instead.
    await this.whatsappQueue.add('broadcast-message', payload, {
      jobId: `broadcast-${payload.broadcastId}-${payload.contactId}-pace-${dueAt}`,
      delay: Math.max(1, dueAt - Date.now()),
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: false,
    });
  }
  /**
   * Atomically claims one pending recipient (outcome NULL -> 'sending') while the broadcast is SENDING.
   * No lock is held afterwards, so the HTTP send happens outside any transaction; concurrent
   * workers on any replica lose the race on `outcome IS NULL` and get 'busy' or 'done'.
   */
  async claimRecipient(tenantId: string, id: string, contactId: string): Promise<ClaimResult> {
    const [claimed]: [RecipientClaim[], number] = await this.broadcastRepository.query(
      `UPDATE whatsapp_broadcast_recipients r SET outcome='sending', claimed_at=now()
       FROM whatsapp_broadcasts b
       WHERE r.tenant_id=$1 AND r.broadcast_id=$2 AND r.contact_id=$3 AND r.outcome IS NULL
         AND b.tenant_id=$1 AND b.id=$2 AND b.status='SENDING' AND b.deleted_at IS NULL
         AND (NOT b.approval_required OR b.approval_status='APPROVED')
         AND (b.recurrence_state IS NULL OR b.recurrence_state NOT IN ('PAUSED','CANCELLED','FAILED'))
         AND (b.recurrence_series_id IS NULL OR EXISTS (
           SELECT 1 FROM whatsapp_broadcasts series WHERE series.tenant_id=$1
             AND series.id=b.recurrence_series_id
             AND (NOT series.approval_required OR series.approval_status='APPROVED')
             AND (series.recurrence_state IS NULL OR series.recurrence_state NOT IN ('PAUSED','CANCELLED','FAILED'))
         ))
       RETURNING r.payload, r.attempt, b.control_version AS "controlVersion", b.template_id AS "templateId",
         b.phone_number_id AS "phoneNumberId", b.contact_filter AS "contactFilter"`,
      [tenantId, id, contactId],
    );
    if (claimed.length) return { state: 'claimed', claim: claimed[0] };
    const [row]: Array<{ outcome: string | null; claimedAt: Date | null }> =
      await this.broadcastRepository.query(
        `SELECT outcome, claimed_at AS "claimedAt" FROM whatsapp_broadcast_recipients WHERE tenant_id=$1 AND broadcast_id=$2 AND contact_id=$3`,
        [tenantId, id, contactId],
      );
    if (row?.outcome !== 'sending') return { state: 'done' };
    const staleAt = (row.claimedAt?.getTime() ?? 0) + STALE_CLAIM_MS;
    if (staleAt > Date.now()) return { state: 'busy', retryAt: staleAt };
    // The claiming worker died mid-send: Meta may have accepted it, so never resend automatically.
    await this.finishRecipient(
      tenantId,
      id,
      contactId,
      'unknown',
      null,
      'Worker stopped during send; acceptance is unknown',
      new Date(Date.now() - STALE_CLAIM_MS),
    );
    return { state: 'done' };
  }

  /** Records a claimed recipient's result and advances counters/completion in one short transaction. */
  finishRecipient(
    tenantId: string,
    id: string,
    contactId: string,
    outcome: RecipientOutcome,
    messageId: string | null,
    error: string | null,
    claimedBefore?: Date,
  ): Promise<boolean> {
    return this.broadcastRepository.manager.transaction(async (m) => {
      const [changed]: [unknown[], number] = await m.query(
        `UPDATE whatsapp_broadcast_recipients SET outcome=$4,message_id=$5,error=$6
         WHERE tenant_id=$1 AND broadcast_id=$2 AND contact_id=$3 AND outcome='sending'
           AND ($7::timestamptz IS NULL OR claimed_at < $7::timestamptz) RETURNING contact_id`,
        [
          tenantId,
          id,
          contactId,
          outcome,
          messageId,
          error?.slice(0, 1000) ?? null,
          claimedBefore ?? null,
        ],
      );
      if (!changed.length) return false;
      const sent = outcome === 'sent' ? 1 : 0;
      // Atomic increments: no broadcast row lock is needed and no concurrent update is lost.
      await m.query(
        `UPDATE whatsapp_broadcasts SET sent=sent+$3, failed=failed+$4,
           status=CASE WHEN status IN ('SENDING','PAUSED') AND sent+failed+1>=total AND sent+$3>0 THEN 'COMPLETED'
                       WHEN status IN ('SENDING','PAUSED') AND sent+failed+1>=total THEN 'FAILED'
                       ELSE status END
         WHERE tenant_id=$1 AND id=$2`,
        [tenantId, id, sent, 1 - sent],
      );
      return true;
    });
  }

  /** Returns a claimed recipient to the pending pool. Bump the attempt whenever a message row was
   * reserved for the current idempotency key, so the next send gets a fresh key. */
  async releaseRecipient(
    tenantId: string,
    id: string,
    contactId: string,
    bumpAttempt: boolean,
  ): Promise<void> {
    await this.broadcastRepository.query(
      `UPDATE whatsapp_broadcast_recipients SET outcome=NULL, claimed_at=NULL, attempt=attempt+$4
       WHERE tenant_id=$1 AND broadcast_id=$2 AND contact_id=$3 AND outcome='sending'`,
      [tenantId, id, contactId, bumpAttempt ? 1 : 0],
    );
  }

  /** Current control state, re-checked right before every provider call. */
  async controlState(
    tenantId: string,
    id: string,
  ): Promise<{ status: Status; controlVersion: number } | null> {
    const [row]: Array<{ status: Status; controlVersion: number }> =
      await this.broadcastRepository.query(
        `SELECT CASE WHEN COALESCE(series.recurrence_state,b.recurrence_state) IN ('PAUSED','CANCELLED','FAILED')
                     THEN 'PAUSED' ELSE b.status END AS status,
                b.control_version AS "controlVersion"
         FROM whatsapp_broadcasts b LEFT JOIN whatsapp_broadcasts series
           ON series.tenant_id=b.tenant_id AND series.id=COALESCE(b.recurrence_series_id,b.id)
         WHERE b.tenant_id=$1 AND b.id=$2 AND b.deleted_at IS NULL`,
        [tenantId, id],
      );
    return row ?? null;
  }

  /** Pauses a running broadcast for an account/template-wide error instead of burning recipients. */
  pauseForError(tenantId: string, id: string, reason: string): Promise<void> {
    return this.locked(tenantId, id, async (b, m) => {
      if (b.status !== Status.SENDING) return;
      b.status = Status.PAUSED;
      b.lastError = reason.slice(0, 1000);
      b.controlVersion++;
      if (b.recurrenceFrequency || b.recurrenceSeriesId) {
        const root = await m.getRepository(WhatsAppBroadcast).findOne({
          where: { tenantId, id: b.recurrenceSeriesId ?? b.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (root) {
          root.recurrenceState = 'PAUSED';
          if ([Status.SCHEDULED, Status.SENDING].includes(root.status)) root.status = Status.PAUSED;
          await m.save(root);
        }
      }
      await m.save(b);
    });
  }

  /** Status of the central message row for a send key, used to tell definite rejections from unknown. */
  async messageStatus(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<{ id: string; status: string } | null> {
    const [row]: Array<{ id: string; status: string }> = await this.broadcastRepository.query(
      `SELECT id, status FROM whatsapp_messages WHERE tenant_id=$1 AND idempotency_key=$2`,
      [tenantId, idempotencyKey],
    );
    return row ?? null;
  }

  /** Contact snapshot for the per-send eligibility re-check. */
  recipientContact(tenantId: string, contactId: string): Promise<Contact | null> {
    return this.contactRepository.findOne({ where: { tenantId, id: contactId } });
  }

  /**
   * Fixed one-second window per sender phone number, shared by every broadcast and replica via Redis.
   * Returns 0 when a slot was taken, otherwise milliseconds until the next window.
   */
  async acquireSendSlot(phoneNumberId: string, perSecond: number): Promise<number> {
    // ponytail: fixed window allows up to 2x burst at a window edge; switch to a sliding log if Meta complains.
    const now = Date.now();
    const window = Math.floor(now / 1000);
    const key = `whatsapp:send-rate:${phoneNumberId}:${window}`;
    const result = await this.whatsappQueue.client.multi().incr(key).pexpire(key, 2000).exec();
    const count = Number(result?.[0]?.[1] ?? Number.POSITIVE_INFINITY);
    return count <= perSecond ? 0 : (window + 1) * 1000 - now;
  }

  /** Re-queues definitely failed recipients with a fresh idempotency key. Skipped (consent) and
   * unknown (possibly delivered) recipients are never retried. */
  async retryFailed(tenantId: string, id: string): Promise<{ retried: number }> {
    const current = await this.findOne(tenantId, id);
    await this.approvedTemplate(tenantId, current.templateId);
    await this.accounts.getCredentials(tenantId, current.phoneNumberId);
    return this.locked(tenantId, id, async (b, m) => {
      if (![Status.COMPLETED, Status.FAILED, Status.PAUSED].includes(b.status))
        throw new BadRequestException(
          'Only finished or paused broadcasts can retry failed recipients',
        );
      const [rows]: [unknown[], number] = await m.query(
        `UPDATE whatsapp_broadcast_recipients SET outcome=NULL, error=NULL, claimed_at=NULL, attempt=attempt+1
         WHERE tenant_id=$1 AND broadcast_id=$2 AND outcome='failed' RETURNING contact_id`,
        [tenantId, id],
      );
      if (!rows.length) return { retried: 0 };
      b.failed = Math.max(0, b.failed - rows.length);
      if (b.status !== Status.PAUSED) {
        // Paused broadcasts pick these up on resume; finished ones restart through prepare's scan.
        b.status = Status.SENDING;
        b.lastError = null;
        b.controlVersion++;
        await this.whatsappQueue.add(
          'broadcast-start',
          { tenantId, broadcastId: id, phoneNumberId: b.phoneNumberId },
          {
            jobId: `broadcast-start-${id}-${b.controlVersion}`,
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: false,
          },
        );
      }
      await m.save(b);
      return { retried: rows.length };
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.locked(tenantId, id, async (b, m) => {
      if (![Status.DRAFT, Status.COMPLETED, Status.FAILED, Status.CANCELLED].includes(b.status))
        throw new BadRequestException('Cancel broadcast before deletion');
      await m.softDelete(WhatsAppBroadcast, { tenantId, id });
    });
  }
}
