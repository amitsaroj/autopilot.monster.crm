import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminFeaturesController } from './admin-features.controller';
import { AdminFeaturesService } from './admin-features.service';
import { PlanFeature } from '@autopilot/core/database/entities/plan-feature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanFeature])],
  controllers: [AdminFeaturesController],
  providers: [AdminFeaturesService],
  exports: [AdminFeaturesService],
})
export class AdminFeaturesModule {}
