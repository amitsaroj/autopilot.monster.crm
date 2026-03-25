import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../../../database/entities/announcement.entity';

@Injectable()
export class AdminAnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async findAll() {
    return this.announcementRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  async create(data: { title: string; content: string; type?: string; expiresAt?: Date }) {
    const announcement = this.announcementRepo.create(data);
    return this.announcementRepo.save(announcement);
  }

  async remove(id: string) {
    const announcement = await this.announcementRepo.findOne({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return this.announcementRepo.remove(announcement);
  }
}
