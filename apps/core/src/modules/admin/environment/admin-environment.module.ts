import { Module } from '@nestjs/common';
import { AdminEnvironmentController } from './admin-environment.controller';
import { AdminEnvironmentService } from './admin-environment.service';

@Module({
  controllers: [AdminEnvironmentController],
  providers: [AdminEnvironmentService],
  exports: [AdminEnvironmentService],
})
export class AdminEnvironmentModule {}
