import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { QueryDeepPartialEntity, Repository } from 'typeorm';
import { ShopifyConnection } from '../../database/entities/shopify-connection.entity';
import { ShopifyWebhookEvent } from '../../database/entities/shopify-webhook-event.entity';
import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import { ShopifyTopic, topicEvent } from './shopify-webhook-topics';

export interface ShopifyWebhookJob {
  tenantId: string;
  eventId: string;
}

@Injectable()
export class ShopifyWebhookService {
  constructor(
    @InjectRepository(ShopifyConnection)
    private readonly connections: Repository<ShopifyConnection>,
    @InjectRepository(ShopifyWebhookEvent)
    private readonly events: Repository<ShopifyWebhookEvent>,
    @InjectQueue(QUEUE_NAMES.SHOPIFY)
    private readonly queue: Queue<ShopifyWebhookJob>,
  ) {}

  async ingest(
    shopInput: string,
    topicInput: string,
    deliveryId: string,
    rawBody: Buffer,
    providerEventId?: string,
  ) {
    const shop = shopInput.trim().toLowerCase();
    const topic = topicInput.trim().toLowerCase() as ShopifyTopic;
    const eventName = topicEvent(topic);
    if (!eventName || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop))
      throw new BadRequestException('Unsupported Shopify shop or webhook topic');
    if (!deliveryId || deliveryId.length > 255)
      throw new BadRequestException('Invalid Shopify webhook delivery ID');
    if (providerEventId !== undefined && (!providerEventId.trim() || providerEventId.length > 255))
      throw new BadRequestException('Invalid Shopify webhook event ID');
    if (!rawBody.length || rawBody.length > 1024 * 1024)
      throw new BadRequestException('Shopify webhook payload is empty or too large');

    const connection = await this.connections
      .createQueryBuilder('connection')
      .where('connection.shopDomain = :shop', { shop })
      .andWhere("connection.status IN ('CONNECTED','DEGRADED')")
      .getOne();
    if (!connection && topic !== 'app/uninstalled')
      throw new BadRequestException(
        'Shopify store is not connected or webhook setup is incomplete',
      );

    let payload: Record<string, unknown>;
    try {
      const raw: unknown = JSON.parse(rawBody.toString('utf8'));
      payload = normalizeShopifyWebhook(topic, raw);
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid Shopify webhook JSON');
    }
    payload.eventId = providerEventId ?? deliveryId;

    if (!connection && topic === 'app/uninstalled') return { accepted: true, duplicate: true };
    const tenantId = connection!.tenantId;
    const insert = this.events
      .createQueryBuilder()
      .insert()
      .values({
        tenantId,
        deliveryId,
        shopDomain: shop,
        topic,
        eventName,
        payload,
        status: 'RECEIVED',
        attempts: 0,
        receivedAt: new Date(),
        processedAt: null,
        lastError: null,
      } as QueryDeepPartialEntity<ShopifyWebhookEvent>)
      .orIgnore()
      .returning('id');
    const result = await insert.execute();
    const event = await this.events.findOne({ where: { tenantId, deliveryId } });
    if (!event) throw new ServiceUnavailableException('Shopify webhook could not be recorded');
    if (event.status === 'PROCESSED') return { accepted: true, duplicate: true };
    try {
      await this.queue.add(
        JOB_NAMES.PROCESS_SHOPIFY_WEBHOOK,
        { tenantId, eventId: event.id },
        {
          jobId: `shopify-${deliveryId}`,
          attempts: 8,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 1000,
          removeOnFail: 1000,
        },
      );
    } catch {
      // A repeated Shopify delivery reuses this row and re-attempts the same stable job ID.
      throw new ServiceUnavailableException('Shopify webhook queue is unavailable');
    }
    return { accepted: true, duplicate: result.identifiers.length === 0 };
  }
}

function valueString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length <= 500) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function normalizeShopifyWebhook(topic: ShopifyTopic, value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new BadRequestException('Shopify webhook body must be an object');
  const data = value as Record<string, unknown>;
  if (topic === 'checkouts/create' || topic === 'checkouts/update') {
    const lineItems: unknown[] = Array.isArray(data['line_items'])
      ? (data['line_items'] as unknown[])
      : [];
    const itemCount = lineItems.reduce<number>((total, item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return total;
      const quantity = (item as Record<string, unknown>)['quantity'];
      if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1)
        return total;
      return quantity > 1_000_000 - total ? 1_000_000 : total + quantity;
    }, 0);
    return {
      updatedAt: valueString(data['updated_at']),
      completedAt: valueString(data['completed_at']) ?? null,
      currency: valueString(data['currency']),
      totalPrice: valueString(data['total_price']),
      itemCount,
    };
  }
  if (topic === 'carts/update') {
    const items = Array.isArray(data['line_items']) ? data['line_items'].slice(0, 100) : [];
    return {
      cartId: valueString(data['id']),
      updatedAt: valueString(data['updated_at']),
      lineItems: items.flatMap((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
        const row = item as Record<string, unknown>;
        return [
          {
            productId: valueString(row['product_id']),
            variantId: valueString(row['variant_id']),
            quantity:
              typeof row['quantity'] === 'number' && Number.isSafeInteger(row['quantity'])
                ? row['quantity']
                : null,
          },
        ];
      }),
    };
  }
  if (topic === 'app/uninstalled') return {};
  return {
    orderId: valueString(data['id']),
    orderNumber: valueString(data['name']),
    currency: valueString(data['currency']),
    totalPrice: valueString(data['total_price']),
    financialStatus: valueString(data['financial_status']),
    fulfillmentStatus: valueString(data['fulfillment_status']),
    createdAt: valueString(data['created_at']),
  };
}
