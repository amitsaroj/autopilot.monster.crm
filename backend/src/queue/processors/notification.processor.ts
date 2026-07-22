import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';
import { NotificationService } from '../../modules/notifications/notification.service';

export interface NotificationJobPayload {
  tenantId: string;
  userId?: string;
  title: string;
  content: string;
  type?: 'EMAIL' | 'SMS' | 'IN_APP' | 'WHATSAPP' | 'VOICE';
  meta?: Record<string, unknown>;
}

@Processor(QUEUE_NAMES.NOTIFICATION)
export class NotificationQueueProcessor {
  private readonly logger = new Logger(NotificationQueueProcessor.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process(JOB_NAMES.SEND_NOTIFICATION)
  async handleSendNotification(
    job: Job<NotificationJobPayload>,
  ): Promise<{ notificationId: string }> {
    const { tenantId, userId, title, content, type, meta } = job.data;
    this.logger.log(`Processing notification job ${job.id} for tenant ${tenantId}`);

    const notification = await this.notificationService.create(tenantId, {
      userId,
      type: type ?? 'IN_APP',
      title,
      content,
      status: 'UNREAD',
      meta,
    });

    return { notificationId: notification.id };
  }
}
