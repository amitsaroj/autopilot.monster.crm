import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCostRulesController } from './admin-cost-rules.controller';
import { AdminCostRulesService } from './admin-cost-rules.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminCostRulesController],
  providers: [AdminCostRulesService],
  exports: [AdminCostRulesService],
})
export class AdminCostRulesModule {}
