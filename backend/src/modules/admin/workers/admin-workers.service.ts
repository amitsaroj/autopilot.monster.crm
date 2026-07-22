import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES } from '../../../queue/queue.constants';

@Injectable()
export class AdminWorkersService {
  private queues: Record<string, Queue>;

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SMS) private readonly smsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WHATSAPP) private readonly whatsappQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WORKFLOW) private readonly workflowQueue: Queue,
    @InjectQueue(QUEUE_NAMES.VOICE) private readonly voiceQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATION) private readonly notificationQueue: Queue,
  ) {
    this.queues = {
      [QUEUE_NAMES.EMAIL]: this.emailQueue,
      [QUEUE_NAMES.SMS]: this.smsQueue,
      [QUEUE_NAMES.WHATSAPP]: this.whatsappQueue,
      [QUEUE_NAMES.WORKFLOW]: this.workflowQueue,
      [QUEUE_NAMES.VOICE]: this.voiceQueue,
      [QUEUE_NAMES.NOTIFICATION]: this.notificationQueue,
    };
  }

  async getWorkersStatus() {
    const workers = await Promise.all(
      Object.entries(this.queues).map(async ([name, queue]) => {
        const queueWorkers = await queue.getWorkers();
        const count = queueWorkers.length;
        return {
          queueName: name,
          activeWorkers: count,
          status: count > 0 ? 'ACTIVE' : 'IDLE',
        };
      }),
    );
    return workers;
  }
}
