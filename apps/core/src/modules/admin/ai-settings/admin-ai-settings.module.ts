import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAISettingsController } from './admin-ai-settings.controller';
import { AdminAISettingsService } from './admin-ai-settings.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminAISettingsController],
  providers: [AdminAISettingsService],
  exports: [AdminAISettingsService],
})
export class AdminAISettingsModule {}
