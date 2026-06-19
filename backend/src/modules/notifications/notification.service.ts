import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from '../../database/entities/notification.entity';
import { BaseRepository } from '../../database/base.repository';
import { TenantSettingsService } from '../tenant-settings/tenant-settings.service';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: true,
  sms: false,
  push: true,
  inApp: true,
};

@Injectable()
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(@InjectRepository(Notification) repo: Repository<Notification>) {
    super(repo);
  }
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly tenantSettingsService: TenantSettingsService,
  ) {}

  async create(tid: string, dto: Partial<Notification>) {
    return this.repo.create(tid, dto);
  }

  async findAll(tid: string) {
    return this.repo.findAll(tid, { order: { createdAt: 'DESC' } });
  }

  async markAsRead(tid: string, id: string) {
    return this.repo.updateWithTenant(tid, id, { status: 'READ' } as Partial<Notification>);
  }

  async readAll(tid: string) {
    const notifications = await this.repo.findAll(tid);
    let count = 0;
    for (const notification of notifications) {
      if (notification.status !== 'READ') {
        await this.repo.updateWithTenant(tid, notification.id, { status: 'READ' } as Partial<Notification>);
        count += 1;
      }
    }
    return { success: true, count };
  }

  async getPreferences(tid: string): Promise<NotificationPreferences> {
    const setting = await this.tenantSettingsService.getSetting(tid, 'notification_preferences');
    if (!setting?.value) {
      return DEFAULT_PREFERENCES;
    }
    return { ...DEFAULT_PREFERENCES, ...setting.value };
  }

  async updatePreferences(
    tid: string,
    dto: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const current = await this.getPreferences(tid);
    const updated = { ...current, ...dto };
    await this.tenantSettingsService.updateSetting(tid, {
      key: 'notification_preferences',
      value: updated,
      group: 'NOTIFICATIONS',
    });
    return updated;
  }
}
