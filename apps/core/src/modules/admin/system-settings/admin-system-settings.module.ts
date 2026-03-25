import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSystemSettingsController } from './admin-system-settings.controller';
import { AdminSystemSettingsService } from './admin-system-settings.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminSystemSettingsController],
  providers: [AdminSystemSettingsService],
  exports: [AdminSystemSettingsService],
})
export class AdminSystemSettingsModule {}
