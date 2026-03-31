import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsageController } from './admin-usage.controller';
import { AdminUsageService } from './admin-usage.service';
import { UsageRecord } from '@autopilot/core/database/entities/usage-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsageRecord])],
  controllers: [AdminUsageController],
  providers: [AdminUsageService],
  exports: [AdminUsageService],
})
export class AdminUsageModule {}
