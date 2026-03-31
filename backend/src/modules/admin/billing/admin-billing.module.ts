import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminBillingController } from './admin-billing.controller';
import { AdminBillingService } from './admin-billing.service';
import { PlatformSetting } from '@autopilot/core/database/entities/platform-setting.entity';
import { Invoice } from '@autopilot/core/database/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting, Invoice])],
  controllers: [AdminBillingController],
  providers: [AdminBillingService],
  exports: [AdminBillingService],
})
export class AdminBillingModule {}
