import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { SchedulerRepository } from './scheduler.repository';
import { ScheduledJob } from '../../database/entities/scheduled-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledJob])],
  controllers: [SchedulerController],
  providers: [SchedulerService, SchedulerRepository],
  exports: [SchedulerService],
})
export class SchedulerModule {}
