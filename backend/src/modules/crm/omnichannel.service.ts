import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';

@Injectable()
export class OmnichannelService {
  private readonly logger = new Logger(OmnichannelService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async sendUnifiedMessage(tenantId: string, contactId: string, text: string, preferredChannel: 'VOICE' | 'WHATSAPP' | 'EMAIL' | 'WEBCHAT') {
    this.logger.log(`[STUB] Sending unified message to contact ${contactId} via ${preferredChannel}`);
    
    // Fallback logic
    let channelUsed = preferredChannel;
    let fallbackTriggered = false;
    
    if (preferredChannel === 'WHATSAPP') {
       // Mock failure and fallback to EMAIL
       fallbackTriggered = true;
       channelUsed = 'EMAIL';
       this.logger.warn(`WhatsApp failed, falling back to ${channelUsed}`);
    }

    // Find or create conversation
    let conv = await this.conversationRepo.findOne({ where: { tenantId, contactId, channel: channelUsed } as any });
    if (!conv) {
      conv = this.conversationRepo.create({
        tenantId,
        contactId,
        channel: channelUsed,
        status: 'OPEN',
      });
      conv = await this.conversationRepo.save(conv);
    }

    // Create message
    const msg = this.messageRepo.create({
      tenantId,
      conversationId: conv.id,
      role: 'ASSISTANT',
      content: text,
      type: 'TEXT',
      meta: { channel: channelUsed, status: 'SENT' }
    });
    await this.messageRepo.save(msg);

    conv.lastMessageAt = new Date();
    await this.conversationRepo.save(conv);

    return { success: true, channelUsed, fallbackTriggered, messageId: msg.id };
  }

  async getConversations(tenantId: string, contactId?: string) {
    const where: any = { tenantId };
    if (contactId) where.contactId = contactId;
    return this.conversationRepo.find({ where, order: { lastMessageAt: 'DESC' } });
  }

  async getMessages(tenantId: string, conversationId: string) {
    return this.messageRepo.find({ where: { tenantId, conversationId } as any, order: { createdAt: 'ASC' } });
  }

  async routeToAgent(tenantId: string, conversationId: string): Promise<{ assignedAgentId: string }> {
    this.logger.log(`[STUB] Routing conversation ${conversationId} to best available agent`);
    
    // Stub: find conversation and assign to agent
    const conv = await this.conversationRepo.findOne({ where: { tenantId, id: conversationId } as any });
    if (conv) {
      conv.meta = { ...conv.meta, assignedAgentId: 'agent_123' };
      await this.conversationRepo.save(conv);
    }
    
    return { assignedAgentId: 'agent_123' };
  }
}
