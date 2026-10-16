import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  BadGatewayException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { EntityManager, IsNull, Repository } from 'typeorm';

import {
  WhatsAppTemplate,
  WhatsAppTemplateCategory,
  WhatsAppTemplateStatus,
} from '../../database/entities/whatsapp-template.entity';
import { WhatsAppAccount } from '../../database/entities/whatsapp-account.entity';
import { WhatsAppTemplateHistory } from '../../database/entities/whatsapp-template-history.entity';
import { CreateWhatsappTemplateDto, UpdateWhatsappTemplateDto } from './dto/whatsapp-template.dto';
import { WhatsappAccountService } from './whatsapp-account.service';

@Injectable()
export class WhatsappTemplateService {
  constructor(
    @InjectRepository(WhatsAppTemplate)
    private readonly templateRepository: Repository<WhatsAppTemplate>,
    @InjectRepository(WhatsAppTemplateHistory)
    private readonly historyRepository: Repository<WhatsAppTemplateHistory>,
    private readonly accountService: WhatsappAccountService,
  ) {}

  findAll(tenantId: string): Promise<WhatsAppTemplate[]> {
    return this.templateRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findHistoryForTemplate(
    tenantId: string,
    templateId: string,
  ): Promise<WhatsAppTemplateHistory[]> {
    await this.findOne(tenantId, templateId);
    return this.historyRepository.find({
      where: { tenantId, templateId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findOne(tenantId: string, id: string): Promise<WhatsAppTemplate> {
    const template = await this.templateRepository.findOne({ where: { id, tenantId } });
    if (!template) {
      throw new NotFoundException('WhatsApp template not found');
    }
    return template;
  }

  async create(
    tenantId: string,
    dto: CreateWhatsappTemplateDto,
    actorId?: string,
  ): Promise<WhatsAppTemplate> {
    this.validateContent(dto.name, dto.language ?? 'en_US', dto.components);
    return this.templateRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(WhatsAppTemplate);
      const template = await repository.save(
        repository.create({
          tenantId,
          name: dto.name,
          category: dto.category,
          language: dto.language ?? 'en_US',
          components: dto.components,
          status: WhatsAppTemplateStatus.PENDING,
        }),
      );
      await this.recordHistory(
        template,
        'local_create',
        actorId,
        manager.getRepository(WhatsAppTemplateHistory),
      );
      return template;
    });
  }

  update(
    tenantId: string,
    id: string,
    dto: UpdateWhatsappTemplateDto,
    actorId?: string,
  ): Promise<WhatsAppTemplate> {
    return this.withSubmissionLock(
      tenantId,
      id,
      'Wait for the current Meta submission before editing',
      (manager) => this.applyUpdate(tenantId, id, dto, actorId, manager),
    );
  }

  /**
   * Cross-replica mutual exclusion for a template's Meta submission and local edits.
   * The transaction only holds the advisory lock; the work itself uses the default pool.
   */
  private withSubmissionLock<T>(
    tenantId: string,
    id: string,
    busyMessage: string,
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.templateRepository.manager.transaction(async (manager) => {
      const [row] = (await manager.query(
        'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',
        [`${tenantId}:${id}:whatsapp-template-submission`],
      )) as Array<{ locked: boolean }>;
      if (!row?.locked) throw new ConflictException(busyMessage);
      return work(manager);
    });
  }

  private async applyUpdate(
    tenantId: string,
    id: string,
    dto: UpdateWhatsappTemplateDto,
    actorId?: string,
    manager?: EntityManager,
  ): Promise<WhatsAppTemplate> {
    const repository = manager?.getRepository(WhatsAppTemplate) ?? this.templateRepository;
    const history = manager?.getRepository(WhatsAppTemplateHistory) ?? this.historyRepository;
    const template = await repository.findOne({ where: { id, tenantId } });
    if (!template) throw new NotFoundException('WhatsApp template not found');
    if (
      template.waTemplateId &&
      ((dto.name !== undefined && dto.name !== template.name) ||
        (dto.language !== undefined && dto.language !== template.language))
    )
      throw new BadRequestException(
        'Submitted template name and language are immutable; create a new draft',
      );
    if (dto.name !== undefined) template.name = dto.name;
    if (dto.category !== undefined) template.category = dto.category;
    if (dto.language !== undefined) template.language = dto.language;
    if (dto.components !== undefined) template.components = dto.components;
    if ('status' in dto) throw new BadRequestException('Template status is managed by Meta');
    this.validateContent(template.name, template.language, template.components);
    const changed =
      dto.name !== undefined ||
      dto.category !== undefined ||
      dto.language !== undefined ||
      dto.components !== undefined;
    if (changed) {
      template.status = WhatsAppTemplateStatus.PENDING;
      const result = await repository
        .createQueryBuilder()
        .update()
        .set({
          name: template.name,
          category: template.category,
          language: template.language,
          components: () => ':components',
          status: template.status,
          rejectionReason: () => 'NULL',
        })
        .setParameter('components', JSON.stringify(template.components))
        .where(
          "id = :id AND tenant_id = :tenantId AND date_trunc('milliseconds', updated_at) = :updatedAt AND deleted_at IS NULL",
          { id, tenantId, updatedAt: template.updatedAt },
        )
        .execute();
      if (result.affected !== 1)
        throw new ConflictException('Template changed during editing; reload and retry');
      const updated = await repository.findOne({ where: { id, tenantId } });
      if (!updated) throw new NotFoundException('WhatsApp template not found');
      await this.recordHistory(updated, 'local_update', actorId, history);
      return updated;
    }
    return template;
  }

  async remove(tenantId: string, id: string, actorId?: string): Promise<void> {
    await this.templateRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(WhatsAppTemplate);
      const template = await repository.findOne({ where: { id, tenantId } });
      if (!template) throw new NotFoundException('WhatsApp template not found');
      await repository.softDelete({ id, tenantId });
      await this.recordHistory(
        template,
        'local_delete',
        actorId,
        manager.getRepository(WhatsAppTemplateHistory),
      );
    });
  }

  syncWithMeta(
    tenantId: string,
    id: string,
    requestedPhoneNumberId?: string,
    actorId?: string,
  ): Promise<WhatsAppTemplate> {
    return this.withSubmissionLock(
      tenantId,
      id,
      'Template submission is already in progress; refresh its status shortly',
      () => this.submit(tenantId, id, requestedPhoneNumberId, actorId),
    );
  }

  /**
   * Applies a signed `message_template_status_update` webhook. The tenant is derived from the
   * WABA's connected account(s); the template must already be bound to that WABA and Meta ID.
   * Returns the number of local templates updated.
   */
  async applyStatusWebhook(
    tenantId: string,
    businessAccountId: string,
    value: Record<string, unknown>,
  ) {
    const waTemplateId = String(value.message_template_id ?? '');
    const event = String(value.event ?? '').toUpperCase();
    if (!/^\d+$/.test(businessAccountId) || !/^\d+$/.test(waTemplateId) || !event) return 0;
    const templates = await this.templateRepository
      .createQueryBuilder('t')
      .where(
        't.tenantId = :tenantId AND t.waTemplateId = :waTemplateId AND t.businessAccountId = :businessAccountId',
        {
          tenantId,
          waTemplateId,
          businessAccountId,
        },
      )
      .andWhere(
        `EXISTS (SELECT 1 FROM whatsapp_accounts a WHERE a.tenant_id = t.tenant_id
          AND a.business_account_id = :businessAccountId AND a.status = 'CONNECTED' AND a.deleted_at IS NULL)`,
      )
      .getMany();
    const reason = typeof value.reason === 'string' && value.reason !== 'NONE' ? value.reason : '';
    for (const template of templates) {
      if (event === 'APPROVED') {
        // Meta approved what was submitted; refresh compares it against local edits first.
        const account = await this.templateRepository.manager
          .getRepository(WhatsAppAccount)
          .findOne({ where: { tenantId, businessAccountId, status: 'CONNECTED' } });
        if (account)
          await this.refreshStatus(
            template.tenantId,
            template.id,
            account.phoneNumberId,
            undefined,
            'provider_webhook',
          );
        continue;
      }
      await this.templateRepository.manager.transaction(async (manager) => {
        const repository = manager.getRepository(WhatsAppTemplate);
        await repository.update(
          { id: template.id, tenantId: template.tenantId },
          event === 'REJECTED'
            ? {
                status: WhatsAppTemplateStatus.REJECTED,
                rejectionReason: reason || 'Meta status: REJECTED',
              }
            : {
                status: WhatsAppTemplateStatus.PENDING,
                rejectionReason:
                  event === 'PENDING'
                    ? () => 'NULL'
                    : `Meta status: ${event}${reason ? `: ${reason}` : ''}`,
              },
        );
        const updated = await repository.findOne({ where: { id: template.id, tenantId } });
        if (updated)
          await this.recordHistory(
            updated,
            'provider_webhook',
            undefined,
            manager.getRepository(WhatsAppTemplateHistory),
          );
      });
    }
    return templates.length;
  }

  private async submit(
    tenantId: string,
    id: string,
    phoneNumberId?: string,
    actorId?: string,
  ): Promise<WhatsAppTemplate> {
    const template = await this.findOne(tenantId, id);
    this.validateContent(template.name, template.language, template.components);
    const credentials = await this.credentials(tenantId, phoneNumberId);
    this.assertAccount(template, credentials.businessAccountId);
    if (template.waTemplateId && !template.businessAccountId) {
      throw new BadRequestException(
        'Refresh this legacy template with its original account before submitting',
      );
    }
    await this.assertUniqueAccountTemplate(template, credentials.businessAccountId);
    const official = await this.listMeta(credentials, template.name);
    const match = official.find(
      (item) =>
        item.name === template.name &&
        item.language === template.language &&
        (!template.waTemplateId || item.id === template.waTemplateId),
    );
    if (template.waTemplateId && !match) {
      throw new NotFoundException(
        'Bound template was not found in the selected Meta account; refresh its status and create a new draft',
      );
    }
    const sameContent = match && this.sameContent(template, match);
    if (match && sameContent && match.status !== 'REJECTED')
      return this.persistStatus(
        template,
        match,
        credentials.businessAccountId,
        actorId,
        'provider_submit',
      );
    // Update the existing provider ID for edits or resubmission without creating duplicates.
    const providerId = typeof match?.id === 'string' ? match.id : undefined;
    if (match && !providerId) throw new BadGatewayException('Invalid Meta template ID');
    if (match && !['APPROVED', 'REJECTED', 'PAUSED'].includes(String(match.status)))
      throw new ConflictException('Meta is reviewing this template; refresh before editing again');
    if (match?.status === 'APPROVED' && match.category !== template.category)
      throw new BadRequestException(
        'Meta does not allow changing an approved template category; create a new draft',
      );
    const path = providerId ?? `${credentials.businessAccountId}/message_templates`;
    const payload = providerId
      ? {
          ...(match?.category !== template.category ? { category: template.category } : {}),
          components: this.resolveTemplateComponents(template.components),
        }
      : {
          name: template.name,
          language: template.language,
          category: template.category,
          components: this.resolveTemplateComponents(template.components),
        };
    let data: unknown;
    try {
      const response = await axios.post<unknown>(this.url(credentials.apiVersion, path), payload, {
        timeout: 15000,
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });
      data = response.data;
    } catch (error: unknown) {
      throw this.providerError(error);
    }
    const result = this.record(data);
    const resultId = providerId ?? result.id;
    if (typeof resultId !== 'string' || !/^\d+$/.test(resultId)) {
      throw new BadGatewayException(
        'Meta returned an invalid template ID; refresh before retrying',
      );
    }
    return this.persistStatus(
      template,
      {
        ...result,
        id: resultId,
        status: result.status ?? 'PENDING',
      },
      credentials.businessAccountId,
      actorId,
      'provider_submit',
    );
  }

  async refreshStatus(
    tenantId: string,
    id: string,
    requestedPhoneNumberId?: string,
    actorId?: string,
    source = 'provider_refresh',
  ): Promise<WhatsAppTemplate> {
    const template = await this.findOne(tenantId, id);
    const credentials = await this.credentials(tenantId, requestedPhoneNumberId);
    this.assertAccount(template, credentials.businessAccountId);
    if (!template.waTemplateId) {
      throw new BadRequestException('Submit this local draft before refreshing its status');
    }
    const official = await this.listMeta(credentials, template.name);
    // Legacy rows are bound only after the provider confirms their exact ID, name and language.
    const match = official.find(
      (item) =>
        item.id === template.waTemplateId &&
        item.name === template.name &&
        item.language === template.language,
    );
    if (!match && !template.businessAccountId)
      throw new NotFoundException(
        'Legacy template ID could not be confirmed in the selected Meta account',
      );
    return this.persistStatus(
      template,
      match ?? {
        id: template.waTemplateId,
        status: 'NOT_FOUND',
        rejected_reason: 'Template was not found in the selected Meta account',
      },
      credentials.businessAccountId,
      actorId,
      source,
    );
  }

  /** Import supported provider-owned templates without overwriting local drafts. */
  async importFromMeta(
    tenantId: string,
    requestedPhoneNumberId?: string,
    actorId?: string,
  ): Promise<{
    imported: number;
    unchanged: number;
    skippedUnsupported: number;
    conflicts: number;
  }> {
    const credentials = await this.credentials(tenantId, requestedPhoneNumberId);
    const official = await this.listMeta(credentials);
    return this.templateRepository.manager.transaction(async (manager) => {
      const [lock] = (await manager.query(
        'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',
        [`${tenantId}:${credentials.businessAccountId}:whatsapp-template-import`],
      )) as Array<{ locked: boolean }>;
      if (!lock?.locked)
        throw new ConflictException('Template import is already running; retry shortly');

      const repository = manager.getRepository(WhatsAppTemplate);
      const counts = { imported: 0, unchanged: 0, skippedUnsupported: 0, conflicts: 0 };
      for (const item of official) {
        const existing = await repository.findOne({
          where: {
            tenantId,
            businessAccountId: credentials.businessAccountId,
            waTemplateId: String(item.id),
          },
        });
        if (existing) {
          counts.unchanged += 1;
          continue;
        }

        const name = String(item.name);
        const language = String(item.language);
        const category = item.category as WhatsAppTemplateCategory;
        const components = { components: item.components as unknown[] };
        try {
          if (!Object.values(WhatsAppTemplateCategory).includes(category))
            throw new BadRequestException('Unsupported template category');
          this.validateContent(name, language, components);
        } catch {
          counts.skippedUnsupported += 1;
          continue;
        }

        const duplicate = await repository
          .createQueryBuilder('template')
          .withDeleted()
          .where('template.tenantId = :tenantId', { tenantId })
          .andWhere('template.businessAccountId = :businessAccountId', {
            businessAccountId: credentials.businessAccountId,
          })
          .andWhere('template.name = :name AND template.language = :language', {
            name,
            language,
          })
          .getOne();
        if (duplicate) {
          counts.conflicts += 1;
          continue;
        }

        const imported = await repository.save(
          repository.create({
            tenantId,
            name,
            language,
            category,
            components,
            businessAccountId: credentials.businessAccountId,
            waTemplateId: String(item.id),
            status:
              item.status === 'APPROVED'
                ? WhatsAppTemplateStatus.APPROVED
                : item.status === 'REJECTED'
                  ? WhatsAppTemplateStatus.REJECTED
                  : WhatsAppTemplateStatus.PENDING,
            rejectionReason:
              item.status === 'REJECTED' && typeof item.rejected_reason === 'string'
                ? item.rejected_reason
                : item.status === 'APPROVED' || item.status === 'PENDING'
                  ? undefined
                  : `Meta status: ${String(item.status).slice(0, 100)}`,
          }),
        );
        await this.recordHistory(
          imported,
          'provider_import',
          actorId,
          manager.getRepository(WhatsAppTemplateHistory),
        );
        counts.imported += 1;
      }
      return counts;
    });
  }

  async refreshAll(
    tenantId: string,
    requestedPhoneNumberId?: string,
    actorId?: string,
  ): Promise<WhatsAppTemplate[]> {
    const credentials = await this.credentials(tenantId, requestedPhoneNumberId);
    const official = await this.listMeta(credentials);
    const templates = await this.templateRepository.find({
      where: [
        { tenantId, businessAccountId: credentials.businessAccountId },
        { tenantId, businessAccountId: IsNull() },
      ],
      order: { createdAt: 'DESC' },
    });
    const refreshed: WhatsAppTemplate[] = [];
    for (const template of templates) {
      if (!template.waTemplateId) continue;
      const match = official.find(
        (item) =>
          item.id === template.waTemplateId &&
          item.name === template.name &&
          item.language === template.language,
      );
      // Unbound legacy rows must not be associated with an account that cannot confirm their ID.
      if (match || template.businessAccountId === credentials.businessAccountId)
        refreshed.push(
          await this.persistStatus(
            template,
            match ?? {
              id: template.waTemplateId,
              status: 'NOT_FOUND',
              rejected_reason: 'Template was not found in the selected Meta account',
            },
            credentials.businessAccountId,
            actorId,
            'provider_refresh_all',
          ),
        );
    }
    return refreshed;
  }

  private assertAccount(template: WhatsAppTemplate, businessAccountId: string): void {
    if (template.businessAccountId && template.businessAccountId !== businessAccountId) {
      throw new BadRequestException(
        'Template belongs to a different WhatsApp business account; select its original account or create a new draft',
      );
    }
  }

  private async assertUniqueAccountTemplate(
    template: WhatsAppTemplate,
    businessAccountId: string,
  ): Promise<void> {
    const existing = await this.templateRepository.findOne({
      where: {
        tenantId: template.tenantId,
        name: template.name,
        language: template.language,
        businessAccountId,
      },
    });
    if (existing && existing.id !== template.id) {
      throw new ConflictException(
        'A local template with this name and language already exists for the selected business account; use that template',
      );
    }
  }

  private async credentials(tenantId: string, phoneNumberId?: string) {
    const credentials = await this.accountService.getCredentials(tenantId, phoneNumberId);
    if (!credentials.accessToken || !credentials.businessAccountId) {
      throw new BadRequestException('WhatsApp tenant credentials are not configured');
    }
    if (
      !/^\d+$/.test(credentials.businessAccountId) ||
      !/^v\d+\.\d+$/.test(credentials.apiVersion)
    ) {
      throw new BadRequestException('Invalid WhatsApp account configuration');
    }
    return credentials;
  }

  private url(version: string, path: string): string {
    if (!/^\d+(?:\/message_templates)?$/.test(path))
      throw new BadGatewayException('Invalid Meta template ID');
    return `https://graph.facebook.com/${version}/${path}`;
  }

  private async listMeta(
    credentials: { accessToken: string; businessAccountId: string; apiVersion: string },
    name?: string,
  ): Promise<Record<string, unknown>[]> {
    const items: Record<string, unknown>[] = [];
    const cursors = new Set<string>();
    let after: string | undefined;
    do {
      let data: unknown;
      try {
        const response = await axios.get<unknown>(
          this.url(credentials.apiVersion, `${credentials.businessAccountId}/message_templates`),
          {
            timeout: 15000,
            headers: { Authorization: `Bearer ${credentials.accessToken}` },
            params: {
              fields: 'id,name,language,category,components,status,rejected_reason',
              limit: 100,
              name,
              after,
            },
          },
        );
        data = response.data;
      } catch (error: unknown) {
        throw this.providerError(error);
      }
      const page = this.record(data);
      if (!Array.isArray(page.data))
        throw new BadGatewayException('Invalid Meta template list response');
      for (const item of page.data) {
        const entry = this.record(item);
        if (
          typeof entry.id !== 'string' ||
          !/^\d+$/.test(entry.id) ||
          typeof entry.name !== 'string' ||
          typeof entry.language !== 'string' ||
          typeof entry.status !== 'string' ||
          typeof entry.category !== 'string' ||
          !Array.isArray(entry.components)
        )
          throw new BadGatewayException('Invalid Meta template list entry');
        items.push(entry);
      }
      const paging = this.record(page.paging);
      const cursor = this.record(paging.cursors).after;
      after = paging.next && typeof cursor === 'string' ? cursor : undefined;
      if (paging.next && !after) throw new BadGatewayException('Invalid Meta pagination response');
      if (after && cursors.has(after))
        throw new BadGatewayException('Repeated Meta pagination cursor');
      if (after) cursors.add(after);
    } while (after);
    return items;
  }

  private async persistStatus(
    template: WhatsAppTemplate,
    official: Record<string, unknown>,
    businessAccountId: string,
    actorId?: string,
    source = 'provider_sync',
  ): Promise<WhatsAppTemplate> {
    if (
      typeof official.id !== 'string' ||
      !/^\d+$/.test(official.id) ||
      typeof official.status !== 'string'
    ) {
      throw new BadGatewayException('Invalid Meta template status response');
    }
    this.assertAccount(template, businessAccountId);
    await this.assertUniqueAccountTemplate(template, businessAccountId);
    const status = official.status;
    const differs = Array.isArray(official.components) && !this.sameContent(template, official);
    const mapped =
      status === 'APPROVED' && !differs
        ? WhatsAppTemplateStatus.APPROVED
        : status === 'REJECTED'
          ? WhatsAppTemplateStatus.REJECTED
          : WhatsAppTemplateStatus.PENDING;
    const reason =
      typeof official.rejected_reason === 'string' ? official.rejected_reason : undefined;
    const providerTemplateId = official.id;
    return this.templateRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(WhatsAppTemplate);
      const result = await repository
        .createQueryBuilder()
        .update()
        .set({
          waTemplateId: providerTemplateId,
          businessAccountId,
          status: mapped,
          rejectionReason: differs
            ? `Local content differs from Meta; submit the draft before sending${status === 'REJECTED' ? `; Meta rejection: ${reason || 'REJECTED'}` : ''}`
            : mapped === WhatsAppTemplateStatus.APPROVED || status === 'PENDING'
              ? () => 'NULL'
              : status === 'REJECTED'
                ? reason || 'Meta status: REJECTED'
                : `Meta status: ${status}${reason ? `: ${reason}` : ''}`,
        })
        .where(
          "id = :id AND tenant_id = :tenantId AND date_trunc('milliseconds', updated_at) = :updatedAt AND business_account_id IS NOT DISTINCT FROM :previousBusinessAccountId AND wa_template_id IS NOT DISTINCT FROM :previousTemplateId AND deleted_at IS NULL",
          {
            id: template.id,
            tenantId: template.tenantId,
            updatedAt: template.updatedAt,
            previousBusinessAccountId: template.businessAccountId ?? null,
            previousTemplateId: template.waTemplateId ?? null,
          },
        )
        .execute();
      if (result.affected !== 1)
        throw new ConflictException('Template changed during Meta request; refresh and retry');
      const updated = await repository.findOne({
        where: { id: template.id, tenantId: template.tenantId },
      });
      if (!updated) throw new NotFoundException('WhatsApp template not found');
      await this.recordHistory(
        updated,
        source,
        actorId,
        manager.getRepository(WhatsAppTemplateHistory),
      );
      return updated;
    });
  }

  private recordHistory(
    template: WhatsAppTemplate,
    source: string,
    actorId?: string,
    repository = this.historyRepository,
  ): Promise<WhatsAppTemplateHistory> {
    return repository.save(
      repository.create({
        tenantId: template.tenantId,
        templateId: template.id,
        source,
        actorId: actorId ?? null,
        snapshot: {
          name: template.name,
          category: template.category,
          language: template.language,
          components: template.components,
          status: template.status,
          businessAccountId: template.businessAccountId ?? null,
          waTemplateId: template.waTemplateId ?? null,
          rejectionReason: template.rejectionReason ?? null,
        },
      }),
    );
  }

  private providerError(error: unknown): BadGatewayException | GatewayTimeoutException {
    if (axios.isAxiosError<unknown>(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new GatewayTimeoutException(
          'Meta template request timed out; refresh before retrying',
        );
      }
      const detail = this.record(this.record(error.response?.data).error);
      // Do not expose Axios messages/configuration or provider text that can contain credentials.
      return new BadGatewayException({
        message: error.response
          ? 'Meta template request failed'
          : 'Unable to reach Meta; refresh before retrying',
        providerStatus: error.response?.status,
        providerCode: typeof detail.code === 'number' ? detail.code : undefined,
        providerSubcode:
          typeof detail.error_subcode === 'number' ? detail.error_subcode : undefined,
      });
    }
    return new BadGatewayException('Meta template request failed');
  }

  private record(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private sameContent(template: WhatsAppTemplate, official: Record<string, unknown>): boolean {
    // Approval examples are not delivery content; Meta may omit them in list responses.
    const normalize = (value: unknown): string => {
      const clean = (item: unknown): unknown => {
        if (Array.isArray(item)) return item.map(clean);
        if (item && typeof item === 'object')
          return Object.fromEntries(
            Object.entries(this.record(item))
              .filter(([key]) => key !== 'example')
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, entry]) => [key, clean(entry)]),
          );
        return item;
      };
      return JSON.stringify(clean(value));
    };
    return (
      official.category === template.category &&
      normalize(official.components) ===
        normalize(this.resolveTemplateComponents(template.components))
    );
  }

  private only(value: Record<string, unknown>, keys: string[]): void {
    if (Object.keys(value).some((key) => !keys.includes(key)))
      throw new BadRequestException('Unsupported template component field');
  }

  private resolveTemplateComponents(
    components: Record<string, unknown>,
  ): Record<string, unknown>[] {
    const list: unknown = Array.isArray(components)
      ? components
      : this.record(components).components;
    if (!Array.isArray(list))
      throw new BadRequestException('components.components must be an array');
    return list.map((item) => this.record(item));
  }

  private validateContent(
    name: string,
    language: string,
    components: Record<string, unknown>,
  ): void {
    if (
      !/^[a-z0-9_]{1,255}$/.test(name) ||
      !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(language) ||
      language.length > 10
    ) {
      throw new BadRequestException('Invalid template name or language');
    }
    const list = this.resolveTemplateComponents(components);
    this.only(this.record(components), ['components']);
    const seen = new Set<string>();
    for (const component of list) {
      const type = component.type;
      if (
        typeof type !== 'string' ||
        !['HEADER', 'BODY', 'FOOTER', 'BUTTONS'].includes(type) ||
        seen.has(type)
      ) {
        throw new BadRequestException('Invalid or duplicate template component');
      }
      seen.add(type);
      if (type === 'BUTTONS') {
        this.only(component, ['type', 'buttons']);
        this.validateButtons(component.buttons);
        continue;
      }
      if (type === 'HEADER' && component.format !== 'TEXT') {
        this.only(component, ['type', 'format', 'example']);
        this.only(this.record(component.example), ['header_handle']);
        if (!['IMAGE', 'VIDEO', 'DOCUMENT'].includes(String(component.format)))
          throw new BadRequestException('Unsupported header format');
        const handles = this.record(component.example).header_handle;
        if (
          !Array.isArray(handles) ||
          handles.length !== 1 ||
          typeof handles[0] !== 'string' ||
          !handles[0].trim() ||
          /^https?:\/\//i.test(handles[0])
        ) {
          throw new BadRequestException('Media header requires an example upload handle');
        }
        continue;
      }
      this.only(
        component,
        type === 'HEADER' ? ['type', 'format', 'text', 'example'] : ['type', 'text', 'example'],
      );
      this.only(this.record(component.example), [type === 'HEADER' ? 'header_text' : 'body_text']);
      this.validateText(component.text, type === 'BODY' ? 1024 : 60, type, component.example);
    }
    if (!seen.has('BODY')) throw new BadRequestException('Template requires one BODY component');
  }

  private validateText(value: unknown, max: number, type: string, example: unknown): void {
    if (typeof value !== 'string' || !value.trim() || value.length > max)
      throw new BadRequestException(`Invalid ${type} text`);
    const matches = [...value.matchAll(/{{(\d+)}}/g)].map((match) => Number(match[1]));
    if ([...value.matchAll(/{{(\d+)}}/g)].some((match) => match[0] !== `{{${Number(match[1])}}}`))
      throw new BadRequestException('Use canonical positional variables such as {{1}}');
    if (
      value.replace(/{{\d+}}/g, '').includes('{{') ||
      value.replace(/{{\d+}}/g, '').includes('}}')
    ) {
      throw new BadRequestException('Use sequential positional variables such as {{1}}');
    }
    const variables = [...new Set(matches)].sort((a, b) => a - b);
    if (
      variables.some((variable, index) => variable !== index + 1) ||
      (type === 'HEADER' && variables.length > 1) ||
      (type === 'FOOTER' && variables.length > 0)
    ) {
      throw new BadRequestException('Invalid template variables');
    }
    if (!variables.length) return;
    const samples = this.record(example)[type === 'HEADER' ? 'header_text' : 'body_text'];
    const rows: unknown[] = type === 'HEADER' ? [samples] : Array.isArray(samples) ? samples : [];
    if (
      !rows.length ||
      rows.some(
        (row) =>
          !Array.isArray(row) ||
          row.length !== variables.length ||
          row.some((sample) => typeof sample !== 'string' || !sample.trim()),
      )
    ) {
      throw new BadRequestException(`${type} requires examples for every variable`);
    }
  }

  private validateButtons(value: unknown): void {
    if (!Array.isArray(value) || !value.length || value.length > 10)
      throw new BadRequestException('Provide 1–10 buttons');
    const counts = new Map<string, number>();
    const groups = value.map((item) => this.record(item).type === 'QUICK_REPLY');
    if (groups.slice(1).filter((group, index) => group !== groups[index]).length > 1)
      throw new BadRequestException('Keep quick reply and other buttons in separate groups');
    for (const item of value) {
      const button = this.record(item);
      const type = String(button.type);
      counts.set(type, (counts.get(type) ?? 0) + 1);
      this.only(
        button,
        type === 'URL'
          ? ['type', 'text', 'url', 'example']
          : type === 'PHONE_NUMBER'
            ? ['type', 'text', 'phone_number']
            : type === 'COPY_CODE'
              ? ['type', 'example']
              : ['type', 'text'],
      );
      if (
        type === 'COPY_CODE' &&
        counts.get(type) === 1 &&
        typeof button.example === 'string' &&
        button.example.trim() &&
        button.example.length <= 20
      )
        continue;
      this.validateText(button.text, 25, 'FOOTER', undefined);
      if (type === 'QUICK_REPLY') continue;
      if (
        type === 'PHONE_NUMBER' &&
        typeof button.phone_number === 'string' &&
        /^\+[1-9]\d{6,14}$/.test(button.phone_number) &&
        counts.get(type) === 1
      )
        continue;
      if (type === 'URL' && typeof button.url === 'string' && (counts.get(type) ?? 0) <= 2) {
        if (!/^https?:\/\//.test(button.url) || button.url.length > 2000)
          throw new BadRequestException('Invalid button URL');
        const variables = button.url.match(/{{\d+}}/g) ?? [];
        if (variables.length) {
          if (
            variables.length !== 1 ||
            !button.url.endsWith('{{1}}') ||
            !Array.isArray(button.example) ||
            button.example.length !== 1 ||
            typeof button.example[0] !== 'string' ||
            !button.example[0].trim()
          )
            throw new BadRequestException('URL variable requires one example and a trailing {{1}}');
        }
        const url = button.url.replace('{{1}}', 'example');
        if (url.includes('{{') || url.includes('}}'))
          throw new BadRequestException('Invalid URL variable');
        try {
          const parsed = new URL(url);
          if (parsed.username || parsed.password) throw new Error('Credentials in URL');
        } catch {
          throw new BadRequestException('Invalid button URL');
        }
        continue;
      }
      throw new BadRequestException('Unsupported or invalid template button');
    }
  }
}
