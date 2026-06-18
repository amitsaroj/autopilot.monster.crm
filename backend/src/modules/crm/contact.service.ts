import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ContactRepository } from './contact.repository';
import { CreateContactDto } from './dto/crm.dto';
import { CreateContactNoteDto } from './dto/deal-lifecycle.dto';
import { Contact } from '../../database/entities/contact.entity';
import { Activity } from '../../database/entities/activity.entity';
import { Note } from '../../database/entities/note.entity';
import { EmailMessage } from '../../database/entities/email-message.entity';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { DealService } from './deal.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly dealService: DealService,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(EmailMessage)
    private readonly emailRepository: Repository<EmailMessage>,
    @InjectRepository(VoiceCall)
    private readonly voiceCallRepository: Repository<VoiceCall>,
    @InjectRepository(WhatsAppMessage)
    private readonly whatsappRepository: Repository<WhatsAppMessage>,
  ) {}

  async create(tenantId: string, dto: CreateContactDto): Promise<Contact> {
    return this.contactRepository.create(tenantId, dto);
  }

  async findAll(tenantId: string): Promise<Contact[]> {
    return this.contactRepository.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<Contact> {
    const contact = await this.contactRepository.findById(tenantId, id);
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(tenantId: string, id: string, dto: Partial<CreateContactDto>): Promise<Contact> {
    return this.contactRepository.updateWithTenant(tenantId, id, dto);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.contactRepository.delete(tenantId, id);
  }

  async getActivities(tenantId: string, contactId: string): Promise<Activity[]> {
    await this.findOne(tenantId, contactId);
    return this.activityRepository.find({
      where: { tenantId, contactId },
      order: { occurredAt: 'DESC' },
    });
  }

  async getDeals(tenantId: string, contactId: string) {
    await this.findOne(tenantId, contactId);
    return this.dealService.findByContact(tenantId, contactId);
  }

  async getNotes(tenantId: string, contactId: string): Promise<Note[]> {
    await this.findOne(tenantId, contactId);
    return this.noteRepository.find({
      where: { tenantId, contactId },
      order: { createdAt: 'DESC' },
    });
  }

  async createNote(tenantId: string, contactId: string, dto: CreateContactNoteDto): Promise<Note> {
    await this.findOne(tenantId, contactId);
    return this.noteRepository.save(
      this.noteRepository.create({
        tenantId,
        contactId,
        title: dto.title,
        content: dto.content,
        tags: [],
      }),
    );
  }

  async getEmails(tenantId: string, contactId: string): Promise<EmailMessage[]> {
    const contact = await this.findOne(tenantId, contactId);
    return this.emailRepository.find({
      where: [{ tenantId, contactId }, { tenantId, to: contact.email }],
      order: { createdAt: 'DESC' },
    });
  }

  async getCalls(tenantId: string, contactId: string): Promise<VoiceCall[]> {
    const contact = await this.findOne(tenantId, contactId);
    const phone = contact.phone ?? contact.mobile;
    if (!phone) {
      return [];
    }

    return this.voiceCallRepository.find({
      where: [
        { tenantId, to: phone },
        { tenantId, from: phone },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getWhatsappMessages(tenantId: string, contactId: string): Promise<WhatsAppMessage[]> {
    const contact = await this.findOne(tenantId, contactId);
    const phone = contact.phone ?? contact.mobile;
    if (!phone) {
      return [];
    }

    return this.whatsappRepository.find({
      where: [
        { tenantId, from: phone },
        { tenantId, to: phone },
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
