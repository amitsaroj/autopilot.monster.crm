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
    ),
  ],
  controllers: [AdminWorkersController],
  providers: [AdminWorkersService],
  exports: [AdminWorkersService],
})
export class AdminWorkersModule {}
