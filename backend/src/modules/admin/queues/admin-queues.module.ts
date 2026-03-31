import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AdminQueuesController } from './admin-queues.controller';
import { AdminQueuesService } from './admin-queues.service';
import { QUEUE_NAMES } from '../../../queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.SMS },
      { name: QUEUE_NAMES.WHATSAPP },
      { name: QUEUE_NAMES.VOICE },
      { name: QUEUE_NAMES.WORKFLOW },
      { name: QUEUE_NAMES.BILLING },
      { name: QUEUE_NAMES.ANALYTICS },
    ),
  ],
  controllers: [AdminQueuesController],
  providers: [AdminQueuesService],
  exports: [AdminQueuesService],
})
export class AdminQueuesModule {}
