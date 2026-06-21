import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { EVENT_NAMES } from '../../events/event.constants';

@Injectable()
export class ContactService {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly dealService: DealService,
    private readonly eventEmitter: EventEmitter2,
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
    const contact = await this.contactRepository.create(tenantId, dto);
    this.eventEmitter.emit(EVENT_NAMES.CONTACT_CREATED, { contact, tenantId });
    return contact;
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
    const contact = await this.contactRepository.updateWithTenant(tenantId, id, dto);
    this.eventEmitter.emit(EVENT_NAMES.CONTACT_UPDATED, { contact, tenantId });
    return contact;
  }

  async assignOwner(tenantId: string, id: string, ownerId: string): Promise<Contact> {
    await this.findOne(tenantId, id);
    const contact = await this.contactRepository.updateWithTenant(tenantId, id, { ownerId });
    this.eventEmitter.emit(EVENT_NAMES.CONTACT_UPDATED, { contact, tenantId });
    return contact;
  }

  async addTag(tenantId: string, id: string, tag: string): Promise<Contact> {
    const contact = await this.findOne(tenantId, id);
    const tags = [...(contact.tags ?? [])];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
    const updated = await this.contactRepository.updateWithTenant(tenantId, id, { tags });
    this.eventEmitter.emit(EVENT_NAMES.CONTACT_UPDATED, { contact: updated, tenantId });
    return updated;
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

  async mergeContacts(
    tenantId: string,
    primaryId: string,
    secondaryId: string,
  ): Promise<Contact> {
    if (primaryId === secondaryId) {
      throw new NotFoundException('Cannot merge contact with itself');
    }

    const primary = await this.findOne(tenantId, primaryId);
    const secondary = await this.findOne(tenantId, secondaryId);

    const mergedTags = Array.from(new Set([...(primary.tags ?? []), ...(secondary.tags ?? [])]));
    const mergedCustomFields = { ...(secondary.customFields ?? {}), ...(primary.customFields ?? {}) };

    await this.contactRepository.updateWithTenant(tenantId, primaryId, {
      tags: mergedTags,
      customFields: mergedCustomFields,
      phone: primary.phone ?? secondary.phone,
      jobTitle: primary.jobTitle ?? secondary.jobTitle,
    });

    await this.activityRepository.update({ tenantId, contactId: secondaryId }, { contactId: primaryId });
    await this.noteRepository.update({ tenantId, contactId: secondaryId }, { contactId: primaryId });
    await this.dealService.reassignContact(tenantId, secondaryId, primaryId);
    await this.contactRepository.delete(tenantId, secondaryId);

    return this.findOne(tenantId, primaryId);
  }
}
