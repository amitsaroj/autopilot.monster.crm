import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AdminWorkersController } from './admin-workers.controller';
import { AdminWorkersService } from './admin-workers.service';
import { QUEUE_NAMES } from '../../../queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.SMS },
      { name: QUEUE_NAMES.WHATSAPP },
      { name: QUEUE_NAMES.WORKFLOW },
      { name: QUEUE_NAMES.VOICE },
      { name: QUEUE_NAMES.NOTIFICATION },
    ),
  ],
  controllers: [AdminWorkersController],
  providers: [AdminWorkersService],
  exports: [AdminWorkersService],
})
export class AdminWorkersModule {}
