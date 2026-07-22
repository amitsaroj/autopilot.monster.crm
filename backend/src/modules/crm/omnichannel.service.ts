import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { Contact } from '../../database/entities/contact.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { OmnichannelPreferredChannel } from './dto/omnichannel.dto';

@Injectable()
export class OmnichannelService {
  private readonly logger = new Logger(OmnichannelService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    private readonly whatsappService: WhatsappService,
  ) {}

  async sendUnifiedMessage(
    tenantId: string,
    contactId: string,
    text: string,
    preferredChannel: OmnichannelPreferredChannel,
  ) {
    const contact = await this.contactRepo.findOne({ where: { tenantId, id: contactId } });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (preferredChannel === OmnichannelPreferredChannel.WHATSAPP) {
      const phone = contact.mobile ?? contact.phone;
      if (!phone) {
        throw new BadRequestException('Contact has no phone number for WhatsApp');
      }

      const message = await this.whatsappService.sendTextMessage(tenantId, phone, text);
      return {
        success: true,
        channelUsed: 'WHATSAPP',
        fallbackTriggered: false,
        messageId: message.id,
      };
    }

    let channelUsed = preferredChannel;
    let fallbackTriggered = false;

    if (preferredChannel === OmnichannelPreferredChannel.VOICE && !contact.phone && !contact.mobile) {
      fallbackTriggered = true;
      channelUsed = OmnichannelPreferredChannel.EMAIL;
      this.logger.warn(`Voice unavailable for contact ${contactId}, falling back to ${channelUsed}`);
    }

    let conv = await this.conversationRepo.findOne({
      where: { tenantId, contactId, channel: channelUsed },
    });
    if (!conv) {
      conv = this.conversationRepo.create({
        tenantId,
        contactId,
        channel: channelUsed,
        status: 'OPEN',
      });
      conv = await this.conversationRepo.save(conv);
    }

    const msg = this.messageRepo.create({
      tenantId,
      conversationId: conv.id,
      role: 'ASSISTANT',
      content: text,
      type: 'TEXT',
      meta: { channel: channelUsed, status: 'SENT' },
    });
    await this.messageRepo.save(msg);

    conv.lastMessageAt = new Date();
    await this.conversationRepo.save(conv);

    return { success: true, channelUsed, fallbackTriggered, messageId: msg.id };
  }

  async getConversations(tenantId: string, contactId?: string) {
    const where: { tenantId: string; contactId?: string } = { tenantId };
    if (contactId) {
      where.contactId = contactId;
    }

    const dbConversations = await this.conversationRepo.find({
      where,
      relations: ['contact'],
      order: { lastMessageAt: 'DESC' },
    });

    const whatsappSummaries = await this.whatsappService.listConversations(tenantId);
    const whatsappConversations = await Promise.all(
      whatsappSummaries.map(async (summary) => {
        const contact = await this.contactRepo.findOne({
          where: [
            { tenantId, phone: summary.phone },
            { tenantId, mobile: summary.phone },
          ],
        });

        if (contactId && contact?.id !== contactId) {
          return null;
        }

        return {
          id: `wa:${summary.phone}`,
          contactId: contact?.id,
          channel: 'WHATSAPP',
          status: summary.status === 'RESOLVED' ? 'CLOSED' : 'OPEN',
          lastMessageAt: summary.lastMessageAt,
          meta: {
            lastPreview: summary.lastMessage,
            unreadCount: summary.unreadCount,
            assignedAgentId: summary.assigneeId,
            phone: summary.phone,
          },
          contact: contact
            ? {
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                name: summary.contactName ?? `${contact.firstName} ${contact.lastName}`.trim(),
              }
            : { name: summary.contactName ?? summary.phone },
        };
      }),
    );

    const mergedWhatsapp = whatsappConversations.filter(
      (conversation): conversation is NonNullable<typeof conversation> => conversation !== null,
    );

    const nonWhatsappDb = dbConversations.filter((conversation) => conversation.channel !== 'WHATSAPP');
    return [...mergedWhatsapp, ...nonWhatsappDb];
  }

  async getMessages(tenantId: string, conversationId: string) {
    if (conversationId.startsWith('wa:')) {
      const phone = conversationId.slice(3);
      return this.whatsappService.getConversation(tenantId, phone);
    }

    return this.messageRepo.find({
      where: { tenantId, conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async routeToAgent(tenantId: string, conversationId: string): Promise<{ assignedAgentId: string }> {
    if (conversationId.startsWith('wa:')) {
      const phone = conversationId.slice(3);
      const contact = await this.contactRepo.findOne({
        where: [
          { tenantId, phone },
          { tenantId, mobile: phone },
        ],
      });

      if (!contact?.ownerId) {
        throw new BadRequestException('No agent assigned to contact for WhatsApp routing');
      }

      await this.whatsappService.assignConversation(tenantId, phone, contact.ownerId);
      return { assignedAgentId: contact.ownerId };
    }

    const conv = await this.conversationRepo.findOne({
      where: { tenantId, id: conversationId },
      relations: ['contact'],
    });
    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    const assignedAgentId = conv.contact?.ownerId;
    if (!assignedAgentId) {
      throw new BadRequestException('No agent available for routing');
    }

    conv.meta = { ...conv.meta, assignedAgentId };
    await this.conversationRepo.save(conv);

    return { assignedAgentId };
  }
}
