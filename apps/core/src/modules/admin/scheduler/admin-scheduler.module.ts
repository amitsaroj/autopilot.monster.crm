import { Module } from '@nestjs/common';
import { AdminSchedulerController } from './admin-scheduler.controller';
import { AdminSchedulerService } from './admin-scheduler.service';

@Module({
  controllers: [AdminSchedulerController],
  providers: [AdminSchedulerService],
  exports: [AdminSchedulerService],
})
export class AdminSchedulerModule {}
