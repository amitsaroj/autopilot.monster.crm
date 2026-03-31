import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEmailSettingsController } from './admin-email-settings.controller';
import { AdminEmailSettingsService } from './admin-email-settings.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminEmailSettingsController],
  providers: [AdminEmailSettingsService],
  exports: [AdminEmailSettingsService],
})
export class AdminEmailSettingsModule {}
