import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminNotificationsController } from './admin-notifications.controller';
import { AdminNotificationsService } from './admin-notifications.service';
import { Notification } from '../../../database/entities/notification.entity';
import { NotificationModule } from '../../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    NotificationModule,
  ],
  controllers: [AdminNotificationsController],
  providers: [AdminNotificationsService],
  exports: [AdminNotificationsService],
})
export class AdminNotificationsModule {}
