import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../../database/entities/notification.entity';
import { stripImmutableFields } from '../../../database/base.repository';
import { UpsertNotificationTemplateDto } from './sub-admin-notifications.dto';

@Injectable()
export class SubAdminNotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
  ) {}

  async findAll(tenantId: string) {
    return this.notifRepo.find({ where: { tenantId } });
  }

  async create(tenantId: string, dto: UpsertNotificationTemplateDto) {
    const data = stripImmutableFields(dto);
    const template = await this.notifRepo.findOne({ where: { tenantId, type: dto.type } });
    if (template) {
      Object.assign(template, data);
      return this.notifRepo.save(template);
    } else {
      const newTemplate = this.notifRepo.create({ ...data, tenantId });
      return this.notifRepo.save(newTemplate);
    }
  }
}
