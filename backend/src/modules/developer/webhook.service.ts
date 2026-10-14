import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { Webhook } from '../../database/entities/webhook.entity';
import { WebhookDelivery } from '../../database/entities/webhook-delivery.entity';
import { CreateWebhookDto, UpdateWebhookDto } from '../tenant-settings/dto/developer-settings.dto';
import { publicWebhookAgents, validateWebhookUrl } from '../workflow/workflow-webhook.util';

export const WEBHOOK_QUEUE = 'developer-webhooks';
export const WEBHOOK_JOB = 'deliver-webhook';
const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 5000;

export interface WebhookJobData {
  tenantId: string;
  deliveryId: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(Webhook) private readonly webhookRepo: Repository<Webhook>,
    @InjectRepository(WebhookDelivery) private readonly deliveryRepo: Repository<WebhookDelivery>,
    @InjectQueue(WEBHOOK_QUEUE) private readonly queue: Queue<WebhookJobData>,
  ) {}

  private validateFields(dto: UpdateWebhookDto): void {
    if (
      dto.name !== undefined &&
      (typeof dto.name !== 'string' || !dto.name.trim() || dto.name.length > 255)
    ) {
      throw new BadRequestException('Webhook name must contain 1–255 characters');
    }
    if (dto.url !== undefined) {
      if (typeof dto.url !== 'string' || dto.url.length > 500)
        throw new BadRequestException('Invalid webhook URL');
      validateWebhookUrl(dto.url);
    }
    if (
      dto.events !== undefined &&
      (!Array.isArray(dto.events) ||
        dto.events.length > 100 ||
        dto.events.some(
          (event) => typeof event !== 'string' || !event.trim() || event.length > 100,
        ))
    ) {
      throw new BadRequestException(
        'Webhook events must be strings of 1–100 characters (maximum 100 events)',
      );
    }
    if (dto.status !== undefined && !['ACTIVE', 'INACTIVE'].includes(dto.status)) {
      throw new BadRequestException('Invalid webhook status');
    }
  }

  async create(tenantId: string, dto: CreateWebhookDto): Promise<Webhook> {
    this.validateFields(dto);
    if (dto.name === undefined || dto.url === undefined || dto.events === undefined) {
      throw new BadRequestException('Webhook name, URL and events are required');
    }
    return this.webhookRepo.save(
      this.webhookRepo.create({
        tenantId,
        name: dto.name,
        url: dto.url,
        events: dto.events,
        secret: crypto.randomBytes(32).toString('hex'),
        status: 'ACTIVE',
      }),
    );
  }

  async findAll(tenantId: string): Promise<Webhook[]> {
    return this.webhookRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<Webhook> {
    const webhook = await this.webhookRepo.findOne({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return webhook;
  }

  async update(tenantId: string, id: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const webhook = await this.findOne(tenantId, id);
    this.validateFields(dto);
    // Explicit fields protect ownership, credentials and concurrent delivery counters.
    const changes: Partial<Webhook> = {};
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.url !== undefined) changes.url = dto.url;
    if (dto.events !== undefined) changes.events = dto.events;
    if (dto.status !== undefined) changes.status = dto.status;
    if (Object.keys(changes).length)
      await this.webhookRepo.update({ id: webhook.id, tenantId }, changes);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.webhookRepo.softRemove(await this.findOne(tenantId, id));
  }

  async getDeliveries(
    tenantId: string,
    webhookId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: WebhookDelivery[]; total: number }> {
    await this.findOne(tenantId, webhookId);
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      !Number.isSafeInteger((page - 1) * limit)
    )
      throw new BadRequestException('Invalid delivery pagination');
    const [data, total] = await this.deliveryRepo.findAndCount({
      where: { tenantId, webhookId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async dispatch(tenantId: string, event: string, payload: Record<string, unknown>): Promise<void> {
    if (!event || event.length > 100) throw new BadRequestException('Invalid webhook event');
    const webhooks = await this.webhookRepo.find({ where: { tenantId, status: 'ACTIVE' } });
    for (const webhook of webhooks) {
      if (webhook.events.includes(event) || webhook.events.includes('*')) {
        await this.enqueue(tenantId, webhook.id, event, payload);
      }
    }
  }

  private async enqueue(
    tenantId: string,
    webhookId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<WebhookDelivery> {
    // shortcut: DB and queue writes are separate; use a shared outbox when atomic handoff is required.
    const delivery = await this.deliveryRepo.save(
      this.deliveryRepo.create({
        tenantId,
        webhookId,
        event,
        payload,
        success: false,
        attempts: 0,
      }),
    );
    try {
      await this.queue.add(
        WEBHOOK_JOB,
        { tenantId, deliveryId: delivery.id },
        {
          jobId: delivery.id,
          attempts: MAX_ATTEMPTS,
          backoff: { type: 'exponential', delay: RETRY_DELAY },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      );
    } catch {
      await this.deliveryRepo.update(
        { id: delivery.id, tenantId },
        { responseBody: 'Delivery could not be queued; replay required' },
      );
      throw new Error('Webhook queue unavailable');
    }
    return delivery;
  }

  async replay(tenantId: string, webhookId: string, deliveryId: string): Promise<WebhookDelivery> {
    const webhook = await this.findOne(tenantId, webhookId);
    if (webhook.status !== 'ACTIVE')
      throw new BadRequestException('Activate the webhook before replaying');
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId, tenantId, webhookId },
    });
    if (!delivery) throw new NotFoundException('Webhook delivery not found');
    // A new delivery preserves the original audit trail and has a separate retry budget.
    return this.enqueue(tenantId, webhookId, delivery.event, delivery.payload);
  }

  async deliver(
    tenantId: string,
    deliveryId: string,
    remainingAttempts = 0,
  ): Promise<{ success: boolean; status?: number }> {
    const delivery = await this.deliveryRepo.findOne({ where: { id: deliveryId, tenantId } });
    if (!delivery || delivery.success) return { success: delivery?.success ?? false };
    const webhook = await this.webhookRepo.findOne({
      where: { id: delivery.webhookId, tenantId, status: 'ACTIVE' },
    });
    if (!webhook) {
      await this.deliveryRepo
        .createQueryBuilder()
        .update()
        .set({
          responseBody: 'Webhook inactive or deleted',
          nextRetryAt: () => 'NULL',
        })
        .where({ id: deliveryId, tenantId })
        .execute();
      return { success: false };
    }

    const body = JSON.stringify(delivery.payload);
    let status: number | undefined;
    let success = false;
    let retryable = true;
    let failure = 'Webhook destination unavailable or rejected';
    let agents: Awaited<ReturnType<typeof publicWebhookAgents>> | undefined;
    try {
      agents = await publicWebhookAgents(webhook.url);
      const response = await axios.request<unknown>({
        url: webhook.url,
        method: 'POST',
        data: body,
        ...agents,
        proxy: false,
        maxRedirects: 0,
        timeout: 10000,
        signal: AbortSignal.timeout(10000),
        maxContentLength: 65536,
        maxBodyLength: 1048576,
        responseType: 'text',
        validateStatus: () => true,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': crypto
            .createHmac('sha256', webhook.secret || '')
            .update(body)
            .digest('hex'),
          'X-Webhook-Event': delivery.event,
          'X-Webhook-Delivery': delivery.id,
        },
      });
      status = response.status;
      success = status >= 200 && status < 300;
      retryable = status === 408 || status === 429 || status >= 500;
      failure = `Webhook returned HTTP ${status}`;
    } catch (error: unknown) {
      if (error instanceof BadRequestException) retryable = false;
      // Never persist receiver content or transport errors, which can contain URL secrets.
    } finally {
      agents?.httpAgent.destroy();
      agents?.httpsAgent.destroy();
    }
    const retry = !success && retryable && remainingAttempts > 0;
    await this.deliveryRepo
      .createQueryBuilder()
      .update()
      .set({
        attempts: () => 'attempts + 1',
        success,
        responseStatus: status ?? (() => 'NULL'),
        responseBody: success ? () => 'NULL' : failure,
        nextRetryAt: retry
          ? new Date(Date.now() + RETRY_DELAY * 2 ** Math.min(delivery.attempts, MAX_ATTEMPTS - 1))
          : () => 'NULL',
      })
      .where({ id: deliveryId, tenantId })
      .execute();
    await this.webhookRepo
      .createQueryBuilder()
      .update()
      .set(
        success
          ? { lastSuccessAt: new Date(), failureCount: 0 }
          : { lastFailureAt: new Date(), failureCount: () => 'failure_count + 1' },
      )
      .where({ id: webhook.id, tenantId })
      .andWhere('deleted_at IS NULL')
      .execute();
    if (!success)
      this.logger.warn(
        `Webhook delivery ${delivery.id} failed${status ? ` (HTTP ${status})` : ''}`,
      );
    if (retry) throw new Error('Webhook delivery failed; retry scheduled');
    return { success, ...(status === undefined ? {} : { status }) };
  }

  async rotateSecret(tenantId: string, id: string): Promise<{ secret: string }> {
    const webhook = await this.findOne(tenantId, id);
    const secret = crypto.randomBytes(32).toString('hex');
    await this.webhookRepo.update({ id: webhook.id, tenantId }, { secret });
    return { secret };
  }

  async test(tenantId: string, id: string): Promise<{ success: boolean; status?: number }> {
    const webhook = await this.findOne(tenantId, id);
    if (webhook.status !== 'ACTIVE')
      throw new BadRequestException('Activate the webhook before testing');
    const delivery = await this.deliveryRepo.save(
      this.deliveryRepo.create({
        tenantId,
        webhookId: id,
        event: 'webhook.test',
        payload: { event: 'webhook.test', timestamp: new Date().toISOString() },
        success: false,
        attempts: 0,
      }),
    );
    return this.deliver(tenantId, delivery.id);
  }
}
