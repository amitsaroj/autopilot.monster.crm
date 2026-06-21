import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppBroadcast, WhatsAppBroadcastStatus } from '../../database/entities/whatsapp-broadcast.entity';

@Injectable()
export class BroadcastService {
  constructor(
    @InjectRepository(WhatsAppBroadcast)
    private readonly broadcastRepo: Repository<WhatsAppBroadcast>,
  ) {}

  async create(tenantId: string, dto: any): Promise<WhatsAppBroadcast> {
    // Stub: In reality we would fetch contacts for each segmentId and add to targetContacts
    let additionalContacts = 0;
    if (dto.segmentIds && dto.segmentIds.length > 0) {
      // Simulate adding contacts from segments
      additionalContacts = dto.segmentIds.length * 10;
    }

    const broadcast = this.broadcastRepo.create({
      ...dto,
      tenantId,
      total: (dto.targetContacts?.length || 0) + additionalContacts,
    } as any) as unknown as WhatsAppBroadcast;
    return this.broadcastRepo.save(broadcast) as unknown as Promise<WhatsAppBroadcast>;
  }

  async findAll(tenantId: string): Promise<WhatsAppBroadcast[]> {
    return this.broadcastRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<WhatsAppBroadcast> {
    const b = await this.broadcastRepo.findOne({ where: { id, tenantId } as any });
    if (!b) throw new NotFoundException('Broadcast not found');
    return b;
  }

  async schedule(tenantId: string, id: string, scheduledAt: Date): Promise<WhatsAppBroadcast> {
    const b = await this.findOne(tenantId, id);
    b.status = WhatsAppBroadcastStatus.SCHEDULED;
    b.scheduledAt = scheduledAt;
    return this.broadcastRepo.save(b) as unknown as Promise<WhatsAppBroadcast>;
  }

  async send(tenantId: string, id: string): Promise<WhatsAppBroadcast> {
    const b = await this.findOne(tenantId, id);
    b.status = WhatsAppBroadcastStatus.SENDING;
    return this.broadcastRepo.save(b) as unknown as Promise<WhatsAppBroadcast>;
  }

  async getStats(tenantId: string, id: string) {
    const b = await this.findOne(tenantId, id);
    return {
      broadcast: b,
      deliveryRate: b.total > 0 ? Math.round((b.delivered / b.total) * 100) : 0,
      readRate: b.delivered > 0 ? Math.round((b.read / b.delivered) * 100) : 0,
    };
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const b = await this.findOne(tenantId, id);
    await this.broadcastRepo.softRemove(b);
  }
}
