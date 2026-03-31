import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSecuritySettingsController } from './admin-security-settings.controller';
import { AdminSecuritySettingsService } from './admin-security-settings.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminSecuritySettingsController],
  providers: [AdminSecuritySettingsService],
  exports: [AdminSecuritySettingsService],
})
export class AdminSecuritySettingsModule {}
