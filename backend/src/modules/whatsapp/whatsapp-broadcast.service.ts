import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import {
  WhatsAppBroadcast,
  WhatsAppBroadcastStatus,
} from '../../database/entities/whatsapp-broadcast.entity';
import { Contact } from '../../database/entities/contact.entity';
import { WhatsappTemplateService } from './whatsapp-template.service';
import {
  WhatsappBroadcastProcessor,
  WhatsappBroadcastJobPayload,
} from './whatsapp-broadcast.processor';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import {
  CreateWhatsappBroadcastDto,
  ScheduleWhatsappBroadcastDto,
} from './dto/whatsapp-broadcast.dto';

@Injectable()
export class WhatsappBroadcastService {
  constructor(
    @InjectRepository(WhatsAppBroadcast)
    private readonly broadcastRepository: Repository<WhatsAppBroadcast>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly templateService: WhatsappTemplateService,
    @InjectQueue(QUEUE_NAMES.WHATSAPP)
    private readonly whatsappQueue: Queue<WhatsappBroadcastJobPayload>,
  ) {}

  findAll(tenantId: string): Promise<WhatsAppBroadcast[]> {
    return this.broadcastRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<WhatsAppBroadcast> {
    const broadcast = await this.broadcastRepository.findOne({ where: { id, tenantId } });
    if (!broadcast) {
      throw new NotFoundException('Broadcast not found');
    }
    return broadcast;
  }

  async create(tenantId: string, dto: CreateWhatsappBroadcastDto): Promise<WhatsAppBroadcast> {
    await this.templateService.findOne(tenantId, dto.templateId);

    return this.broadcastRepository.save(
      this.broadcastRepository.create({
        tenantId,
        name: dto.name,
        templateId: dto.templateId,
        templateVariables: dto.templateVariables ?? {},
        contactFilter: dto.contactFilter ?? {},
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: dto.scheduledAt ? WhatsAppBroadcastStatus.SCHEDULED : WhatsAppBroadcastStatus.DRAFT,
      }),
    );
  }

  async schedule(
    tenantId: string,
    id: string,
    dto: ScheduleWhatsappBroadcastDto,
  ): Promise<WhatsAppBroadcast> {
    const broadcast = await this.findOne(tenantId, id);
    broadcast.scheduledAt = new Date(dto.scheduledAt);
    broadcast.status = WhatsAppBroadcastStatus.SCHEDULED;
    return this.broadcastRepository.save(broadcast);
  }

  async send(tenantId: string, id: string): Promise<WhatsAppBroadcast> {
    const broadcast = await this.findOne(tenantId, id);
    if (
      broadcast.status === WhatsAppBroadcastStatus.SENDING ||
      broadcast.status === WhatsAppBroadcastStatus.COMPLETED
    ) {
      throw new BadRequestException('Broadcast already sent or in progress');
    }

    const contacts = await this.resolveContacts(tenantId, broadcast.contactFilter);
    broadcast.status = WhatsAppBroadcastStatus.SENDING;
    broadcast.total = contacts.length;
    broadcast.sent = 0;
    broadcast.failed = 0;
    await this.broadcastRepository.save(broadcast);

    const jobs = contacts
      .map((contact, index) => {
        const phone = contact.mobile ?? contact.phone;
        if (!phone) {
          return null;
        }

        const message = this.buildTemplateMessage(broadcast.templateVariables, contact);
        return {
          name: 'broadcast-message',
          data: {
            tenantId,
            broadcastId: broadcast.id,
            phone,
            message,
            total: contacts.length,
          } satisfies WhatsappBroadcastJobPayload,
          opts: { delay: WhatsappBroadcastProcessor.computeDelay(index) },
        };
      })
      .filter((job): job is NonNullable<typeof job> => job !== null);

    if (jobs.length === 0) {
      broadcast.status = WhatsAppBroadcastStatus.FAILED;
      broadcast.failed = contacts.length;
      return this.broadcastRepository.save(broadcast);
    }

    await this.whatsappQueue.addBulk(jobs);
    return broadcast;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const broadcast = await this.findOne(tenantId, id);
    if (broadcast.status === WhatsAppBroadcastStatus.SENDING) {
      throw new BadRequestException('Cannot delete broadcast while sending');
    }
    await this.broadcastRepository.softDelete({ id, tenantId });
  }

  private async resolveContacts(
    tenantId: string,
    filter: WhatsAppBroadcast['contactFilter'],
  ): Promise<Contact[]> {
    const where: Record<string, unknown> = { tenantId };

    if (filter.status?.length) {
      where.status = In(filter.status);
    }

    const contacts = await this.contactRepository.find({ where: where as never });

    if (filter.tags?.length) {
      return contacts.filter((contact) =>
        filter.tags!.some((tag) => (contact.tags ?? []).includes(tag)),
      );
    }

    return contacts;
  }

  private buildTemplateMessage(
    variables: Record<string, string>,
    contact: Contact,
  ): string {
    let message = variables.body ?? 'Hello {{firstName}}';
    message = message.replace(/\{\{firstName\}\}/g, contact.firstName);
    message = message.replace(/\{\{lastName\}\}/g, contact.lastName);
    message = message.replace(/\{\{email\}\}/g, contact.email);

    for (const [key, value] of Object.entries(variables)) {
      if (key !== 'body') {
        message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }
    }

    return message;
  }
}
