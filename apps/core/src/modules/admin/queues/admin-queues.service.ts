import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES } from '../../../queue/queue.constants';

@Injectable()
export class AdminQueuesService {
  private queues: Record<string, Queue>;

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SMS) smsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WHATSAPP) whatsappQueue: Queue,
    @InjectQueue(QUEUE_NAMES.VOICE) voiceQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WORKFLOW) workflowQueue: Queue,
    @InjectQueue(QUEUE_NAMES.BILLING) billingQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ANALYTICS) analyticsQueue: Queue,
  ) {
    this.queues = {
      [QUEUE_NAMES.EMAIL]: emailQueue,
      [QUEUE_NAMES.SMS]: smsQueue,
      [QUEUE_NAMES.WHATSAPP]: whatsappQueue,
      [QUEUE_NAMES.VOICE]: voiceQueue,
      [QUEUE_NAMES.WORKFLOW]: workflowQueue,
      [QUEUE_NAMES.BILLING]: billingQueue,
      [QUEUE_NAMES.ANALYTICS]: analyticsQueue,
    };
  }

  async getQueuesStatus() {
    const stats = await Promise.all(
      Object.entries(this.queues).map(async ([name, queue]) => {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
        ]);
        return {
          name,
          counts: { waiting, active, completed, failed, delayed },
        };
      }),
    );
    return stats;
  }

  async cleanQueue(queueName: string) {
    const queue = this.queues[queueName];
    if (!queue) throw new Error('Queue not found');
    await Promise.all([
      queue.clean(1000, 'completed'),
      queue.clean(1000, 'failed'),
    ]);
    return { success: true };
  }
}
