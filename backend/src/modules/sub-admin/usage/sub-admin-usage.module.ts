import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminUsageController } from './sub-admin-usage.controller';
import { SubAdminUsageService } from './sub-admin-usage.service';
import { UsageRecord } from '../../../database/entities/usage-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsageRecord])],
  controllers: [SubAdminUsageController],
  providers: [SubAdminUsageService],
  exports: [SubAdminUsageService],
})
export class SubAdminUsageModule {}
