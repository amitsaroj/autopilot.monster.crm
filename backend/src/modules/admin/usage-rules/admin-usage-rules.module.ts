import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsageRulesController } from './admin-usage-rules.controller';
import { AdminUsageRulesService } from './admin-usage-rules.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminUsageRulesController],
  providers: [AdminUsageRulesService],
  exports: [AdminUsageRulesService],
})
export class AdminUsageRulesModule {}
