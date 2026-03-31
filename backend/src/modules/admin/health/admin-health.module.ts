import { Module } from '@nestjs/common';
import { AdminHealthController } from './admin-health.controller';
import { AdminHealthService } from './admin-health.service';

@Module({
  controllers: [AdminHealthController],
  providers: [AdminHealthService],
  exports: [AdminHealthService],
})
export class AdminHealthModule {}
