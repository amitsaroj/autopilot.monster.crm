import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from '../../database/entities/webhook.entity';
import { WebhookDelivery } from '../../database/entities/webhook-delivery.entity';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepo: Repository<Webhook>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepo: Repository<WebhookDelivery>,
  ) {}

  async create(tenantId: string, dto: Partial<Webhook>): Promise<Webhook> {
    const secret = crypto.randomBytes(32).toString('hex');
    const webhook = this.webhookRepo.create({
      ...dto, tenantId, secret, status: 'ACTIVE',
    } as any) as unknown as Webhook;
    return this.webhookRepo.save(webhook) as unknown as Promise<Webhook>;
  }

  async findAll(tenantId: string): Promise<Webhook[]> {
    return this.webhookRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<Webhook> {
    const w = await this.webhookRepo.findOne({ where: { id, tenantId } as any });
    if (!w) throw new NotFoundException('Webhook not found');
    return w;
  }

  async update(tenantId: string, id: string, dto: Partial<Webhook>): Promise<Webhook> {
    const w = await this.findOne(tenantId, id);
    Object.assign(w, dto);
    return this.webhookRepo.save(w) as unknown as Promise<Webhook>;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const w = await this.findOne(tenantId, id);
    await this.webhookRepo.softRemove(w);
  }

  async getDeliveries(tenantId: string, webhookId: string, page = 1, limit = 20): Promise<{ data: WebhookDelivery[]; total: number }> {
    const [data, total] = await this.deliveryRepo.findAndCount({
      where: { tenantId, webhookId } as any,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  /** Fire webhook to all matching endpoints */
  async dispatch(tenantId: string, event: string, payload: Record<string, any>): Promise<void> {
    const webhooks = await this.webhookRepo.find({
      where: { tenantId, status: 'ACTIVE' } as any,
    });

    for (const webhook of webhooks) {
      if (!webhook.events.includes(event) && !webhook.events.includes('*')) continue;

      const delivery = this.deliveryRepo.create({
        tenantId,
        webhookId: webhook.id,
        event,
        payload,
        success: false,
        attempts: 1,
      } as any) as unknown as WebhookDelivery;

      try {
        const signature = this.sign(JSON.stringify(payload), webhook.secret || '');
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });

        delivery.responseStatus = response.status;
        delivery.success = response.ok;
        webhook.lastSuccessAt = new Date();
        webhook.failureCount = 0;
      } catch (error: any) {
        delivery.responseBody = error.message;
        delivery.success = false;
        webhook.lastFailureAt = new Date();
        webhook.failureCount += 1;
        this.logger.warn(`Webhook delivery failed: ${webhook.url} - ${error.message}`);
      }

      await this.deliveryRepo.save(delivery);
      await this.webhookRepo.save(webhook);
    }
  }

  private sign(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async rotateSecret(tenantId: string, id: string): Promise<{ secret: string }> {
    const w = await this.findOne(tenantId, id);
    const newSecret = crypto.randomBytes(32).toString('hex');
    w.secret = newSecret;
    await this.webhookRepo.save(w);
    return { secret: newSecret };
  }

  async test(tenantId: string, id: string): Promise<{ success: boolean; status?: number }> {
    const w = await this.findOne(tenantId, id);
    try {
      const testPayload = { event: 'webhook.test', timestamp: new Date().toISOString() };
      const response = await fetch(w.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(5000),
      });
      return { success: response.ok, status: response.status };
    } catch {
      return { success: false };
    }
  }
}
