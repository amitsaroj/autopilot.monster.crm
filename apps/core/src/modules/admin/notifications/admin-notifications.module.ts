import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminNotificationsController } from './admin-notifications.controller';
import { AdminNotificationsService } from './admin-notifications.service';
import { AdminAnnouncementsController } from './admin-announcements.controller';
import { AdminAnnouncementsService } from './admin-announcements.service';
import { Notification } from '../../../database/entities/notification.entity';
import { Announcement } from '../../../database/entities/announcement.entity';
import { NotificationModule } from '../../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Announcement]),
    NotificationModule,
  ],
  controllers: [AdminNotificationsController, AdminAnnouncementsController],
  providers: [AdminNotificationsService, AdminAnnouncementsService],
  exports: [AdminNotificationsService, AdminAnnouncementsService],
})
export class AdminNotificationsModule {}
