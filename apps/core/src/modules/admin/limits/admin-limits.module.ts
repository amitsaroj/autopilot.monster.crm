import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLimitsController } from './admin-limits.controller';
import { AdminLimitsService } from './admin-limits.service';
import { PlanLimit } from '@autopilot/core/database/entities/plan-limit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanLimit])],
  controllers: [AdminLimitsController],
  providers: [AdminLimitsService],
  exports: [AdminLimitsService],
})
export class AdminLimitsModule {}
