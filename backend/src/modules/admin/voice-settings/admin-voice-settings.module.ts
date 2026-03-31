import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminVoiceSettingsController } from './admin-voice-settings.controller';
import { AdminVoiceSettingsService } from './admin-voice-settings.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminVoiceSettingsController],
  providers: [AdminVoiceSettingsService],
  exports: [AdminVoiceSettingsService],
})
export class AdminVoiceSettingsModule {}
