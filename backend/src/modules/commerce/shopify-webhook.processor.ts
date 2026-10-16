import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor, InjectQueue } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bull';
import { Repository } from 'typeorm';
import { ShopifyConnection } from '../../database/entities/shopify-connection.entity';
import { ShopifyWebhookEvent } from '../../database/entities/shopify-webhook-event.entity';
import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import type { ShopifyWebhookJob } from './shopify-webhook.service';

@Processor(QUEUE_NAMES.SHOPIFY)
@Injectable()
export class ShopifyWebhookProcessor {
  private readonly logger = new Logger(ShopifyWebhookProcessor.name);
  private sweeping = false;

  constructor(
    @InjectRepository(ShopifyWebhookEvent)
    private readonly eventsRepo: Repository<ShopifyWebhookEvent>,
    @InjectRepository(ShopifyConnection)
    private readonly connections: Repository<ShopifyConnection>,
    private readonly events: EventEmitter2,
    @InjectQueue(QUEUE_NAMES.SHOPIFY)
    private readonly queue: Queue<ShopifyWebhookJob>,
  ) {}

  @Process({ name: JOB_NAMES.PROCESS_SHOPIFY_WEBHOOK, concurrency: 10 })
  async process(job: Job<ShopifyWebhookJob>): Promise<void> {
    const { tenantId, eventId } = job.data;
    const claimed = (await this.eventsRepo.query(
      `UPDATE shopify_webhook_events SET status='PROCESSING', attempts=attempts+1, updated_at=now()
       WHERE id=$1 AND tenant_id=$2 AND status <> 'PROCESSED'
         AND (status <> 'PROCESSING' OR updated_at < now()-interval '60 seconds')
       RETURNING id`,
      [eventId, tenantId],
    )) as Array<{ id: string }>;
    if (!claimed.length) return;
    const event = await this.eventsRepo.findOne({ where: { id: eventId, tenantId } });
    if (!event) return;
    try {
      if (event.topic === 'app/uninstalled') {
        await this.connections.update(
          { tenantId, shopDomain: event.shopDomain },
          {
            status: 'DISCONNECTED',
            encryptedAccessToken: '',
            encryptedRefreshToken: null,
            scopes: [],
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            webhookStatus: 'NOT_CONFIGURED',
            webhookSubscriptionIds: [],
            disconnectedAt: new Date(),
          },
        );
      }
      await this.events.emitAsync(event.eventName, {
        tenantId,
        shop: event.shopDomain,
        eventId: event.deliveryId,
        ...event.payload,
      });
      await this.eventsRepo.update(
        { id: event.id, tenantId },
        { status: 'PROCESSED', processedAt: new Date(), lastError: null },
      );
    } catch {
      await this.eventsRepo.update(
        { id: event.id, tenantId },
        { status: 'FAILED', lastError: 'Commerce event dispatch failed' },
      );
      throw new Error('Shopify event dispatch failed');
    }
  }

  @Interval(30000)
  async recoverPending(): Promise<void> {
    if (this.sweeping) return;
    this.sweeping = true;
    try {
      const rows = await this.eventsRepo
        .createQueryBuilder('event')
        .where("event.status = 'RECEIVED' AND event.receivedAt < :stale", {
          stale: new Date(Date.now() - 30000),
        })
        .orWhere("event.status = 'FAILED' AND event.updatedAt < :retry", {
          retry: new Date(Date.now() - 30000),
        })
        .orWhere("event.status = 'PROCESSING' AND event.updatedAt < :stale", {
          stale: new Date(Date.now() - 60000),
        })
        .orderBy('event.receivedAt', 'ASC')
        .take(100)
        .getMany();
      for (const event of rows) {
        const suffix =
          event.status === 'RECEIVED'
            ? ''
            : `-retry-${event.attempts}-${event.updatedAt.getTime()}`;
        await this.queue.add(
          JOB_NAMES.PROCESS_SHOPIFY_WEBHOOK,
          { tenantId: event.tenantId, eventId: event.id },
          {
            jobId: `shopify-${event.deliveryId}${suffix}`,
            attempts: 8,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 1000,
            removeOnFail: 1000,
          },
        );
        await this.eventsRepo.update(
          { id: event.id, tenantId: event.tenantId, status: event.status },
          { status: 'RECEIVED' },
        );
      }
    } catch {
      this.logger.warn('Shopify webhook recovery scan deferred');
    } finally {
      this.sweeping = false;
    }
  }
}
