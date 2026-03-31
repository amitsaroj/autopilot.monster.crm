import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminFeatureRulesController } from './admin-feature-rules.controller';
import { AdminFeatureRulesService } from './admin-feature-rules.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminFeatureRulesController],
  providers: [AdminFeatureRulesService],
  exports: [AdminFeatureRulesService],
})
export class AdminFeatureRulesModule {}
