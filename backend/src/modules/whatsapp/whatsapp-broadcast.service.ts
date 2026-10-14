import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';
import { isUUID } from 'class-validator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  WhatsAppBroadcast,
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
      if (
        broadcast.audiencePrepared ||
        ![Status.SENDING, Status.SCHEDULED].includes(broadcast.status)
      )
        return;
      broadcast.status = Status.FAILED;
      broadcast.lastError = reason.slice(0, 1000);
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
  async create(tenantId: string, dto: CreateWhatsappBroadcastDto): Promise<WhatsAppBroadcast> {
    for (const property of ['templateVariables', 'templateComponents', 'contactFilter'] as const) {
      if (dto[property] !== undefined && !isBroadcastJson(dto[property], property))
        throw new BadRequestException(`Invalid ${property}`);
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
        status: Status.DRAFT,
      }),
    );
    return dto.scheduledAt ? this.schedule(tenantId, b.id, { scheduledAt: dto.scheduledAt }) : b;
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
        `(SELECT COUNT(*) FROM whatsapp_messages recent WHERE recent.tenant_id=c.tenantId AND recent."to"=${phone} AND recent.direction='OUTBOUND' AND recent.broadcast_id IS NOT NULL AND recent.deleted_at IS NULL AND recent.status <> 'FAILED' AND recent.created_at > :since) < :cap`,
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
    const history = `SELECT wc.status FROM whatsapp_consents wc WHERE wc.tenant_id=c.tenantId
      AND wc.phone=${phone} AND wc.deleted_at IS NULL`;
    return q
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
  private async activate(tenantId: string, id: string, scheduledAt?: Date, resume = false) {
    const current = await this.findOne(tenantId, id);
    await this.approvedTemplate(tenantId, current.templateId);
    if (!resume && (await this.preview(tenantId, id)).limitExceeded)
      throw new BadRequestException(
        'Eligible audience exceeds the configured recipient limit; narrow the audience before starting',
      );
    const credentials = await this.accounts.getCredentials(tenantId, current.phoneNumberId);
    return this.locked(tenantId, id, async (b, m) => {
      if (!(resume ? [Status.PAUSED] : [Status.DRAFT, Status.SCHEDULED]).includes(b.status)) {
        throw new BadRequestException('Invalid broadcast transition');
      }
      b.phoneNumberId = credentials.phoneNumberId;
      b.lastError = null;
      b.status = scheduledAt ? Status.SCHEDULED : Status.SENDING;
      b.scheduledAt = scheduledAt;
      b.controlVersion++;
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
      return m.save(b);
    });
  }
  schedule(tenantId: string, id: string, dto: ScheduleWhatsappBroadcastDto) {
    const at = new Date(dto.scheduledAt);
    if (!Number.isFinite(at.getTime()) || at.getTime() <= Date.now())
      throw new BadRequestException('Schedule must be in the future');
    return this.activate(tenantId, id, at);
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
  private control(tenantId: string, id: string, status: Status) {
    return this.locked(tenantId, id, async (b, m) => {
      const allowed =
        status === Status.PAUSED
          ? [Status.SCHEDULED, Status.SENDING]
          : [Status.DRAFT, Status.SCHEDULED, Status.SENDING, Status.PAUSED];
      if (!allowed.includes(b.status))
        throw new BadRequestException('Invalid broadcast transition');
      b.status = status;
      b.controlVersion++;
      return m.save(b);
    });
  }
  async prepare(tenantId: string, id: string) {
    await this.locked(tenantId, id, async (b, m) => {
      if (![Status.SCHEDULED, Status.SENDING].includes(b.status)) return;
      if (b.scheduledAt && b.scheduledAt.getTime() > Date.now()) return;
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
            const payload = {
              tenantId,
              broadcastId: id,
              contactId: c.id,
              phoneNumberId: b.phoneNumberId,
              phone: c.mobile?.trim() || c.phone?.trim(),
              templateName: t.name,
              language: t.language,
              components: interpolate(
                this.sendComponents(t.components, b.templateComponents, b.templateVariables),
              ),
            };
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
      await m.save(b);
    });
    // Bounded recovery scan. Re-running a start job re-publishes the same stable recipient IDs.
    let after = '';
    for (;;) {
      const rows = await this.broadcastRepository.query(
        `SELECT contact_id, payload FROM whatsapp_broadcast_recipients WHERE tenant_id=$1 AND broadcast_id=$2 AND outcome IS NULL AND contact_id::text > $3 ORDER BY contact_id LIMIT 250`,
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
  async remove(tenantId: string, id: string): Promise<void> {
    await this.locked(tenantId, id, async (b, m) => {
      if (![Status.DRAFT, Status.COMPLETED, Status.FAILED, Status.CANCELLED].includes(b.status))
        throw new BadRequestException('Cancel broadcast before deletion');
      await m.softDelete(WhatsAppBroadcast, { tenantId, id });
    });
  }
}
