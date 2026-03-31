import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../../database/entities/notification.entity';

@Injectable()
export class SubAdminNotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
  ) {}

  async findAll(tenantId: string) {
    return this.notifRepo.find({ where: { tenantId } });
  }

  async create(tenantId: string, dto: any) {
    let template = await this.notifRepo.findOne({ where: { tenantId, type: dto.type } });
    if (template) {
      Object.assign(template, dto);
      return this.notifRepo.save(template);
    } else {
      const newTemplate = this.notifRepo.create({ ...dto, tenantId });
      return this.notifRepo.save(newTemplate);
    }
  }
}
