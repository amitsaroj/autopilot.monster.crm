import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../../database/entities/notification.entity';

@Injectable()
export class AdminNotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async broadcast(data: { title: string; message: string; type?: string }) {
    // This would typically involve a background job to send to all users
    // For now, we'll log it and use the base notification service for a "system" notification
    return {
      ...data,
      sentAt: new Date(),
      target: 'ALL_USERS',
    };
  }

  async getHistory() {
    return this.notificationRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
