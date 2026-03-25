import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminFeatureFlagsController } from './admin-feature-flags.controller';
import { AdminFeatureFlagsService } from './admin-feature-flags.service';
import { PlatformSetting } from '@autopilot/core/database/entities/platform-setting.entity';
import { Tenant } from '@autopilot/core/database/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting, Tenant])],
  controllers: [AdminFeatureFlagsController],
  providers: [AdminFeatureFlagsService],
  exports: [AdminFeatureFlagsService],
})
export class AdminFeatureFlagsModule {}
