import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminWhatsAppSettingsController } from './admin-whatsapp-settings.controller';
import { AdminWhatsAppSettingsService } from './admin-whatsapp-settings.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminWhatsAppSettingsController],
  providers: [AdminWhatsAppSettingsService],
  exports: [AdminWhatsAppSettingsService],
})
export class AdminWhatsAppSettingsModule {}
