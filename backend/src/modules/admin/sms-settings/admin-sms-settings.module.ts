import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSmsSettingsController } from './admin-sms-settings.controller';
import { AdminSmsSettingsService } from './admin-sms-settings.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminSmsSettingsController],
  providers: [AdminSmsSettingsService],
  exports: [AdminSmsSettingsService],
})
export class AdminSmsSettingsModule {}
