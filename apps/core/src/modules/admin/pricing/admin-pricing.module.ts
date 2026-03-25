import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPricingController } from './admin-pricing.controller';
import { AdminPricingService } from './admin-pricing.service';
import { PlatformSetting } from '@autopilot/core/database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminPricingController],
  providers: [AdminPricingService],
  exports: [AdminPricingService],
})
export class AdminPricingModule {}
