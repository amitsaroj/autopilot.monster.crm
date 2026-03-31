import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPlanOverrideController } from './admin-plan-override.controller';
import { AdminPlanOverrideService } from './admin-plan-override.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminPlanOverrideController],
  providers: [AdminPlanOverrideService],
  exports: [AdminPlanOverrideService],
})
export class AdminPlanOverrideModule {}
