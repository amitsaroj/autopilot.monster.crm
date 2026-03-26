import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminNotificationsController } from './sub-admin-notifications.controller';
import { SubAdminNotificationsService } from './sub-admin-notifications.service';
import { Notification } from '../../../database/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [SubAdminNotificationsController],
  providers: [SubAdminNotificationsService],
  exports: [SubAdminNotificationsService],
})
export class SubAdminNotificationsModule {}
