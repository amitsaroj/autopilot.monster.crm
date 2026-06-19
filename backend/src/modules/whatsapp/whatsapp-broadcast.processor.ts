import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';

import { QUEUE_NAMES } from '../../queue/queue.constants';
import {
  WhatsAppBroadcast,
  WhatsAppBroadcastStatus,
} from '../../database/entities/whatsapp-broadcast.entity';
import { WhatsappService } from './whatsapp.service';

export interface WhatsappBroadcastJobPayload {
  tenantId: string;
  broadcastId: string;
  phone: string;
  message: string;
  total: number;
}

const META_RATE_LIMIT_MS = 13;

@Processor(QUEUE_NAMES.WHATSAPP)
export class WhatsappBroadcastProcessor {
  private readonly logger = new Logger(WhatsappBroadcastProcessor.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    @InjectRepository(WhatsAppBroadcast)
    private readonly broadcastRepository: Repository<WhatsAppBroadcast>,
  ) {}

  @Process('broadcast-message')
  async handleBroadcastMessage(job: Job<WhatsappBroadcastJobPayload>): Promise<void> {
    const { tenantId, broadcastId, phone, message, total } = job.data;

    try {
      await this.whatsappService.sendTextMessage(tenantId, phone, message);
      await this.incrementStat(broadcastId, 'sent', total);
    } catch (error) {
      this.logger.error(`Broadcast message failed for ${broadcastId}`, error);
      await this.incrementStat(broadcastId, 'failed', total);
    }
  }

  private async incrementStat(
    broadcastId: string,
    field: 'sent' | 'failed',
    total: number,
  ): Promise<void> {
    const broadcast = await this.broadcastRepository.findOne({ where: { id: broadcastId } });
    if (!broadcast) {
      return;
    }

    if (field === 'sent') {
      broadcast.sent += 1;
    } else {
      broadcast.failed += 1;
    }

    const processed = broadcast.sent + broadcast.failed;
    if (processed >= total) {
      broadcast.status =
        broadcast.sent === 0 ? WhatsAppBroadcastStatus.FAILED : WhatsAppBroadcastStatus.COMPLETED;
    }

    await this.broadcastRepository.save(broadcast);
  }

  static computeDelay(index: number): number {
    return index * META_RATE_LIMIT_MS;
  }
}
