import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { NotificationService, NotificationRepository } from './notification.service';
import { NotificationController } from './notification.controller';
import { TenantSettingsModule } from '../tenant-settings/tenant-settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), TenantSettingsModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationModule {}
