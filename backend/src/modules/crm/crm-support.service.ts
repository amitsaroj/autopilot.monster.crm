import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, FindOptionsOrder, FindOptionsWhere, ILike, ObjectLiteral } from 'typeorm';
import { LeadService } from './lead.service';
import { ContactService } from './contact.service';
import {
  ActivityRepository,
  TaskCrmRepository,
  NoteRepository,
  ProductRepository,
  QuoteRepository,
  CampaignRepository,
  EmailRepository,
  TagRepository,
  SegmentRepository,
  CustomFieldRepository,
} from './crm-support.repository';
import { ContactRepository } from './contact.repository';
import { DealRepository } from './deal.repository';
import { BaseRepository } from '../../database/base.repository';
import { DealStatus } from '../../database/entities/deal.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Lead } from '../../database/entities/lead.entity';
import { Contact, ContactStatus } from '../../database/entities/contact.entity';
import { Company } from '../../database/entities/company.entity';
import { Activity } from '../../database/entities/activity.entity';
import { Note } from '../../database/entities/note.entity';
import { Task } from '../../database/entities/task.entity';
import { Quote } from '../../database/entities/quote.entity';
import { CampaignStatus, CampaignType } from '../../database/entities/campaign.entity';
import { EmailDirection } from '../../database/entities/email-message.entity';
import { Segment } from '../../database/entities/segment.entity';
import { EmailService } from '../../shared/email/email.service';
import { toPaginatedResult, wantsPagination } from '../../common/utils/pagination.util';
import {
  CreateActivityDto,
  CreateCampaignDto,
  CreateCustomFieldDto,
  CreateNoteDto,
  CreateProductDto,
  CreateQuoteDto,
  CreateSegmentDto,
  CreateTagDto,
  CreateTaskDto,
  CrmFeedQueryDto,
  CrmListQueryDto,
  SEGMENT_ENTITY_TYPES,
  SEGMENT_OPERATORS,
  SegmentEntityType,
  SegmentMembersQueryDto,
  SendCrmEmailDto,
  UpdateCampaignDto,
  UpdateCustomFieldDto,
  UpdateProductDto,
  UpdateQuoteDto,
  UpdateTaskDto,
} from './dto/crm.dto';

async function mustFind<T>(row: Promise<T | null>, label: string): Promise<T> {
  const found = await row;
  if (!found) throw new NotFoundException(`${label} not found`);
  return found;
}

/** Escapes LIKE wildcards so user search text is matched literally (default escape char is `\`). */
const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const toDate = (s?: string) => (s ? new Date(s) : undefined);

/** Activity/note feed: tenant-scoped, filtered by linked record; paginated when page/limit given. */
async function feed<T extends { tenantId: string; contactId?: string; companyId?: string; dealId?: string }>(
  repo: BaseRepository<T>,
  tid: string,
  q: CrmFeedQueryDto,
  order: FindOptionsOrder<T>,
) {
  const where = {
    ...(q.contactId ? { contactId: q.contactId } : {}),
    ...(q.companyId ? { companyId: q.companyId } : {}),
    ...(q.dealId ? { dealId: q.dealId } : {}),
  } as FindOptionsWhere<T>;
  if (!wantsPagination(q)) return repo.findAll(tid, { where, order });
  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  const [rows, total] = await repo.findAndCount(tid, {
    where,
    order,
    skip: (page - 1) * limit,
    take: limit,
  });
  return toPaginatedResult(rows, total, page, limit);
}

@Injectable()
export class ActivityService {
  constructor(private readonly repo: ActivityRepository) {}
  create(tid: string, dto: CreateActivityDto) {
    return this.repo.create(tid, {
      ...dto,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });
  }
  findAll(tid: string) {
    return this.repo.findAll(tid, { order: { occurredAt: 'DESC' } });
  }
  list(tid: string, query: CrmFeedQueryDto) {
    return feed<Activity>(this.repo, tid, query, { occurredAt: 'DESC' });
  }
  findByDeal(tid: string, dealId: string) {
    return this.repo.findAll(tid, { where: { dealId }, order: { occurredAt: 'DESC' } });
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class TaskCrmService {
  constructor(private readonly repo: TaskCrmRepository) {}
  create(tid: string, dto: CreateTaskDto) {
    return this.repo.create(tid, { ...dto, dueDate: toDate(dto.dueDate) });
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  async findPaginated(tid: string, query: CrmListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<Task> = {
      ...(query.status ? { status: query.status as Task['status'] } : {}),
      ...(query.search ? { title: ILike(`%${likeEscape(query.search)}%`) } : {}),
    };
    const [data, total] = await this.repo.findAndCount(tid, {
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return toPaginatedResult(data, total, page, limit);
  }
  findOne(tid: string, id: string) {
    return mustFind(this.repo.findById(tid, id), 'Task');
  }
  async update(tid: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(tid, id);
    return this.repo.updateWithTenant(tid, id, { ...dto, dueDate: toDate(dto.dueDate) });
  }
  async remove(tid: string, id: string) {
    await this.findOne(tid, id);
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class NoteService {
  constructor(private readonly repo: NoteRepository) {}
  create(tid: string, dto: CreateNoteDto) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid, { order: { createdAt: 'DESC' } });
  }
  list(tid: string, query: CrmFeedQueryDto) {
    return feed<Note>(this.repo, tid, query, { createdAt: 'DESC' });
  }
  async remove(tid: string, id: string) {
    await mustFind(this.repo.findById(tid, id), 'Note');
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class ProductService {
  constructor(private readonly repo: ProductRepository) {}
  create(tid: string, dto: CreateProductDto) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  async findPaginated(tid: string, query: CrmListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.repo.findAndCount(tid, {
      where: {
        ...(query.status ? { status: query.status as 'ACTIVE' | 'INACTIVE' } : {}),
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    if (!query.search) {
      return toPaginatedResult(data, total, page, limit);
    }
    const all = await this.repo.findAll(tid);
    const needle = query.search.toLowerCase();
    const matched = all.filter(
      (p) => p.name?.toLowerCase().includes(needle) || p.sku?.toLowerCase().includes(needle),
    );
    return toPaginatedResult(
      matched.slice((page - 1) * limit, page * limit),
      matched.length,
      page,
      limit,
    );
  }
  findOne(tid: string, id: string) {
    return mustFind(this.repo.findById(tid, id), 'Product');
  }
  async update(tid: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tid, id);
    return this.repo.updateWithTenant(tid, id, dto);
  }
  async remove(tid: string, id: string) {
    await this.findOne(tid, id);
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class QuoteService {
  constructor(private readonly repo: QuoteRepository) {}
  create(tid: string, dto: CreateQuoteDto) {
    const number =
      dto.number ??
      `Q-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}${Math.floor(
        Math.random() * 1296,
      )
        .toString(36)
        .toUpperCase()}`;
    return this.repo.create(tid, { ...dto, number, validUntil: toDate(dto.validUntil) });
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  async findPaginated(tid: string, query: CrmListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<Quote> = {
      ...(query.status ? { status: query.status as Quote['status'] } : {}),
      ...(query.search ? { number: ILike(`%${likeEscape(query.search)}%`) } : {}),
    };
    const [data, total] = await this.repo.findAndCount(tid, {
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return toPaginatedResult(data, total, page, limit);
  }
  findOne(tid: string, id: string) {
    return mustFind(this.repo.findById(tid, id), 'Quote');
  }
  async update(tid: string, id: string, dto: UpdateQuoteDto) {
    await this.findOne(tid, id);
    return this.repo.updateWithTenant(tid, id, { ...dto, validUntil: toDate(dto.validUntil) });
  }
  async remove(tid: string, id: string) {
    await this.findOne(tid, id);
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class CampaignCrmService {
  constructor(private readonly repo: CampaignRepository) {}
  create(tid: string, dto: CreateCampaignDto) {
    return this.repo.create(tid, { ...dto, scheduledAt: toDate(dto.scheduledAt) });
  }
  findAll(tid: string, type?: CampaignType) {
    return this.repo.findAll(tid, {
      where: type ? { type } : {},
      order: { createdAt: 'DESC' },
    });
  }
  async countByStatus(tid: string, status: CampaignStatus): Promise<number> {
    const [, total] = await this.repo.findAndCount(tid, { where: { status }, take: 1 });
    return total;
  }
  findOne(tid: string, id: string) {
    return mustFind(this.repo.findById(tid, id), 'Campaign');
  }
  async update(tid: string, id: string, dto: UpdateCampaignDto) {
    await this.findOne(tid, id);
    return this.repo.updateWithTenant(tid, id, { ...dto, scheduledAt: toDate(dto.scheduledAt) });
  }
  async remove(tid: string, id: string) {
    await this.findOne(tid, id);
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class AnalyticsCrmService {
  constructor(
    private readonly dealRepo: DealRepository,
    private readonly contactRepo: ContactRepository,
    private readonly leadService: LeadService,
  ) {}

  async getSummary(tid: string) {
    const deals = await this.dealRepo.findAll(tid);
    const leads = await this.leadService.findAll(tid);
    const contacts = await this.contactRepo.findAll(tid);

    const wonDeals = deals.filter((d) => d.status === DealStatus.WON);
    const totalRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

    return {
      totalDeals: deals.length,
      totalRevenue,
      totalLeads: leads.length,
      totalContacts: contacts.length,
      winRate: deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0,
    };
  }

  async getPipelineData(tid: string) {
    const deals = await this.dealRepo.findAll(tid, { relations: ['stage'] });
    const byStage = new Map<string, { value: number; amount: number }>();

    for (const deal of deals) {
      const stageName = deal.stage?.name ?? 'Unknown';
      const existing = byStage.get(stageName) ?? { value: 0, amount: 0 };
      existing.value += 1;
      existing.amount += Number(deal.value) || 0;
      byStage.set(stageName, existing);
    }

    return Array.from(byStage.entries()).map(([name, stats]) => ({
      name,
      value: stats.value,
      amount: stats.amount,
    }));
  }

  async getLeadFunnels(tid: string) {
    const leads = await this.leadService.findAll(tid);
    const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'];
    return statuses.map((s) => ({
      name: s,
      count: leads.filter((l) => l.status === s).length,
    }));
  }

  async getRevenueTrend(tid: string) {
    const deals = await this.dealRepo.findAll(tid);
    const wonDeals = deals.filter((d) => d.status === DealStatus.WON);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return months.map((month, idx) => {
      const monthlyDeals = wonDeals.filter((d) => new Date(d.createdAt).getMonth() === idx);
      return {
        name: month,
        revenue: monthlyDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
      };
    });
  }

  async getAgentPerformance(tid: string) {
    const deals = await this.dealRepo.findAll(tid);
    const owners = Array.from(new Set(deals.map((d) => d.ownerId).filter((id) => !!id)));

    return owners.map((ownerId) => {
      const userDeals = deals.filter((d) => d.ownerId === ownerId);
      const won = userDeals.filter((d) => d.status === DealStatus.WON);
      return {
        ownerId,
        totalDeals: userDeals.length,
        wonValue: won.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
        winRate: userDeals.length > 0 ? (won.length / userDeals.length) * 100 : 0,
      };
    });
  }
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

@Injectable()
export class EmailCrmService {
  constructor(
    private readonly repo: EmailRepository,
    private readonly mailer: EmailService,
    private readonly config: ConfigService,
  ) {}

  findAll(tid: string) {
    return this.repo.findAll(tid, { order: { createdAt: 'DESC' } });
  }

  findOne(tid: string, id: string) {
    return mustFind(this.repo.findById(tid, id), 'Email');
  }

  /** Delivers through the shared SMTP mailer; only a successfully sent message is recorded. */
  async sendEmail(tid: string, data: SendCrmEmailDto) {
    const html = escapeHtml(data.body).replace(/\r?\n/g, '<br>');
    const sent = await this.mailer.sendEmail(data.to, data.subject, html);
    if (!sent) throw new BadGatewayException('Email could not be delivered by the mail provider');
    return this.repo.create(tid, {
      ...data,
      from: this.config.get<string>('SMTP_FROM', '"Autopilot Monster" <noreply@autopilots.monster>'),
      direction: EmailDirection.OUTBOUND,
      isRead: true,
    });
  }

  async markAsRead(tid: string, id: string) {
    return this.repo.updateWithTenant(tid, id, { isRead: true });
  }

  async remove(tid: string, id: string) {
    await this.findOne(tid, id);
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class BulkCrmService {
  constructor(
    private readonly leadService: LeadService,
    private readonly contactService: ContactService,
  ) {}

  async bulkUpdateStatus(
    tid: string,
    entityType: 'lead' | 'contact',
    ids: string[],
    status: string,
    actorId?: string,
  ) {
    if (entityType === 'lead') {
      return Promise.all(ids.map((id) => this.leadService.update(tid, id, { status }, actorId)));
    }
    const contactStatus = Object.values(ContactStatus).find((s) => s === status);
    if (!contactStatus) {
      throw new BadRequestException(
        `status must be one of: ${Object.values(ContactStatus).join(', ')}`,
      );
    }
    return Promise.all(
      ids.map((id) => this.contactService.update(tid, id, { status: contactStatus }, actorId)),
    );
  }

  async bulkDelete(tid: string, entityType: 'lead' | 'contact', ids: string[], actorId?: string) {
    const service = entityType === 'lead' ? this.leadService : this.contactService;
    return Promise.all(ids.map((id) => service.remove(tid, id, actorId)));
  }
}

@Injectable()
export class TagService {
  constructor(private readonly repo: TagRepository) {}
  create(tid: string, dto: CreateTagDto) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  async remove(tid: string, id: string) {
    await mustFind(this.repo.findById(tid, id), 'Tag');
    return this.repo.delete(tid, id);
  }
}

type SegmentFieldKind = 'text' | 'number' | 'date' | 'array';

/** Allowlist of segment rule fields per entity (entity property → comparison kind). */
const SEGMENT_FIELDS: Record<SegmentEntityType, Record<string, SegmentFieldKind>> = {
  LEAD: {
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    phone: 'text',
    status: 'text',
    source: 'text',
    score: 'number',
    createdAt: 'date',
  },
  CONTACT: {
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    phone: 'text',
    mobile: 'text',
    status: 'text',
    leadSource: 'text',
    jobTitle: 'text',
    companyId: 'text',
    ownerId: 'text',
    tags: 'array',
    createdAt: 'date',
  },
  COMPANY: {
    name: 'text',
    domain: 'text',
    industry: 'text',
    city: 'text',
    country: 'text',
    sizeRange: 'text',
    tags: 'array',
    createdAt: 'date',
  },
  DEAL: {
    name: 'text',
    status: 'text',
    pipelineId: 'text',
    stageId: 'text',
    ownerId: 'text',
    companyId: 'text',
    contactId: 'text',
    value: 'number',
    probability: 'number',
    tags: 'array',
    createdAt: 'date',
  },
};

const SEGMENT_TARGETS = { LEAD: Lead, CONTACT: Contact, COMPANY: Company, DEAL: Deal } as const;

type Scalar = string | number;

export interface CompiledSegment {
  sql: string | null;
  params: Record<string, Scalar | Scalar[]>;
}

/**
 * Compiles segment rules (`{ operator: 'AND'|'OR', conditions: [{ field, operator, value }] }` —
 * the same format WhatsApp broadcast audiences read) into a parameterised SQL predicate on alias
 * `e`. Only allowlisted fields/operators are accepted; values are always bound parameters.
 */
export function compileSegmentRules(entityType: string, rules: unknown): CompiledSegment {
  const fail = (msg: string): never => {
    throw new BadRequestException(`Invalid segment rules: ${msg}`);
  };
  if (!(SEGMENT_ENTITY_TYPES as readonly string[]).includes(entityType)) fail('unknown entityType');
  const fields = SEGMENT_FIELDS[entityType as SegmentEntityType];
  const r = (rules ?? {}) as { operator?: unknown; conditions?: unknown };
  const joiner = r.operator ?? 'AND';
  if (joiner !== 'AND' && joiner !== 'OR') fail('operator must be AND or OR');
  const conditions = r.conditions ?? [];
  if (!Array.isArray(conditions)) fail('conditions must be an array');

  const params: CompiledSegment['params'] = {};
  const clauses = (conditions as Array<Record<string, unknown>>).map((c, i) => {
    const field = c.field === 'tag' ? 'tags' : String(c.field ?? '');
    const kind = fields[field] ?? fail(`field "${field}" is not filterable for ${entityType}`);
    const op = String(c.operator ?? 'eq');
    if (!(SEGMENT_OPERATORS as readonly string[]).includes(op)) fail(`operator "${op}"`);
    const p = `seg${i}`;
    const col = `e.${field}`;
    const value = c.value;

    if (op === 'in') {
      if (!Array.isArray(value) || !value.length || value.some((v) => typeof v === 'object'))
        fail(`"in" on ${field} needs a non-empty list`);
      params[p] = (value as Scalar[]).map((v) => (kind === 'number' ? Number(v) : String(v)));
      if (kind === 'array') return `${col} && ARRAY[:...${p}]::text[]`;
      if (kind === 'text') return `CAST(${col} AS text) IN (:...${p})`;
      return `${col} IN (:...${p})`;
    }
    if (typeof value !== 'string' && typeof value !== 'number') fail(`value for ${field}`);
    const scalar = value as Scalar;

    if (kind === 'array') {
      if (!['eq', 'equals', 'contains', 'neq'].includes(op)) fail(`operator "${op}" on ${field}`);
      params[p] = String(scalar);
      return op === 'neq' ? `NOT (:${p} = ANY(${col}))` : `:${p} = ANY(${col})`;
    }
    if (kind === 'number' && !Number.isFinite(Number(scalar))) fail(`${field} needs a number`);
    if (kind === 'date' && Number.isNaN(Date.parse(String(scalar)))) fail(`${field} needs a date`);
    if (kind === 'text') {
      if (['gt', 'gte', 'lt', 'lte'].includes(op)) fail(`operator "${op}" on ${field}`);
      if (op === 'contains') {
        params[p] = `%${likeEscape(String(scalar))}%`;
        return `CAST(${col} AS text) ILIKE :${p}`;
      }
      params[p] = String(scalar);
      return `CAST(${col} AS text) ${op === 'neq' ? '<>' : '='} :${p}`;
    }
    if (op === 'contains') fail(`operator "contains" on ${field}`);
    params[p] = kind === 'number' ? Number(scalar) : String(scalar);
    const sqlOp = { eq: '=', equals: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=' }[
      op as 'eq'
    ];
    return `${col} ${sqlOp} :${p}`;
  });

  return { sql: clauses.length ? `(${clauses.join(` ${joiner} `)})` : null, params };
}

@Injectable()
export class SegmentService {
  constructor(
    private readonly repo: SegmentRepository,
    private readonly dataSource: DataSource,
  ) {}
  create(tid: string, dto: CreateSegmentDto) {
    const entityType = dto.entityType ?? 'LEAD';
    compileSegmentRules(entityType, dto.rules);
    return this.repo.create(tid, { ...dto, entityType });
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  findOne(tid: string, id: string): Promise<Segment> {
    return mustFind(this.repo.findById(tid, id), 'Segment');
  }
  /** Evaluates the segment's rules in SQL against its entity table, tenant-scoped. */
  async members(tid: string, id: string, query: SegmentMembersQueryDto) {
    const segment = await this.findOne(tid, id);
    const { sql, params } = compileSegmentRules(segment.entityType, segment.rules);
    const target = SEGMENT_TARGETS[segment.entityType as SegmentEntityType];
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.dataSource
      .getRepository<ObjectLiteral>(target)
      .createQueryBuilder('e')
      .where('e.tenantId = :tenantId', { tenantId: tid });
    if (sql) qb.andWhere(sql, params);
    const [rows, total] = await qb
      .orderBy('e.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return toPaginatedResult(rows, total, page, limit);
  }
  async remove(tid: string, id: string) {
    await this.findOne(tid, id);
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class CustomFieldService {
  constructor(private readonly repo: CustomFieldRepository) {}
  create(tid: string, dto: CreateCustomFieldDto) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  findOne(tid: string, id: string) {
    return mustFind(this.repo.findById(tid, id), 'Custom field');
  }
  async update(tid: string, id: string, dto: UpdateCustomFieldDto) {
    await this.findOne(tid, id);
    return this.repo.updateWithTenant(tid, id, dto);
  }
  async remove(tid: string, id: string) {
    await this.findOne(tid, id);
    return this.repo.delete(tid, id);
  }
}
