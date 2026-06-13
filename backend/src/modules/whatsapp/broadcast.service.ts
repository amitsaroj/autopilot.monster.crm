import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappBroadcast } from '../../database/entities/whatsapp-broadcast.entity';

@Injectable()
export class BroadcastService {
  constructor(
    @InjectRepository(WhatsappBroadcast)
    private readonly broadcastRepo: Repository<WhatsappBroadcast>,
  ) {}

  async create(tenantId: string, dto: Partial<WhatsappBroadcast> & { segmentIds?: string[] }): Promise<WhatsappBroadcast> {
    // Stub: In reality we would fetch contacts for each segmentId and add to targetContacts
    let additionalContacts = 0;
    if (dto.segmentIds && dto.segmentIds.length > 0) {
      // Simulate adding contacts from segments
      additionalContacts = dto.segmentIds.length * 10;
    }

    const broadcast = this.broadcastRepo.create({
      ...dto, tenantId,
      totalRecipients: (dto.targetContacts?.length || 0) + additionalContacts,
    } as any) as unknown as WhatsappBroadcast;
    return this.broadcastRepo.save(broadcast) as unknown as Promise<WhatsappBroadcast>;
  }

  async findAll(tenantId: string): Promise<WhatsappBroadcast[]> {
    return this.broadcastRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<WhatsappBroadcast> {
    const b = await this.broadcastRepo.findOne({ where: { id, tenantId } as any });
    if (!b) throw new NotFoundException('Broadcast not found');
    return b;
  }

  async schedule(tenantId: string, id: string, scheduledAt: Date): Promise<WhatsappBroadcast> {
    const b = await this.findOne(tenantId, id);
    b.status = 'SCHEDULED';
    b.scheduledAt = scheduledAt;
    return this.broadcastRepo.save(b) as unknown as Promise<WhatsappBroadcast>;
  }

  async send(tenantId: string, id: string): Promise<WhatsappBroadcast> {
    const b = await this.findOne(tenantId, id);
    b.status = 'SENDING';
    return this.broadcastRepo.save(b) as unknown as Promise<WhatsappBroadcast>;
  }

  async getStats(tenantId: string, id: string) {
    const b = await this.findOne(tenantId, id);
    return {
      broadcast: b,
      deliveryRate: b.totalRecipients > 0 ? Math.round((b.deliveredCount / b.totalRecipients) * 100) : 0,
      readRate: b.deliveredCount > 0 ? Math.round((b.readCount / b.deliveredCount) * 100) : 0,
    };
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const b = await this.findOne(tenantId, id);
    await this.broadcastRepo.softRemove(b);
  }
}
