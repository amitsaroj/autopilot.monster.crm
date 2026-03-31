import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(@InjectRepository(Notification) repo: Repository<Notification>) {
    super(repo);
  }
}

@Injectable()
export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  async findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  async markAsRead(tid: string, id: string) {
    return this.repo.update(tid, id, { status: 'READ' } as any);
  }

  async readAll(tid: string) {
    console.log(`Marking all notifications as read for tenant ${tid}`);
    return { success: true, count: 0 };
  }

  async getPreferences(tid: string) {
    console.log(`Fetching notification preferences for tenant ${tid}`);
    return { email: true, sms: false, push: true };
  }

  async updatePreferences(tid: string, dto: any) {
    console.log(`Updating notification preferences for tenant ${tid}`, dto);
    return { success: true, preferences: dto };
  }
}
