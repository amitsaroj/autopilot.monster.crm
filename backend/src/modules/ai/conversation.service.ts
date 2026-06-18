import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { BaseRepository } from '../../database/base.repository';
import { CreateConversationDto } from './dto/conversation.dto';

@Injectable()
export class ConversationRepository extends BaseRepository<Conversation> {
  constructor(@InjectRepository(Conversation) repo: Repository<Conversation>) {
    super(repo);
  }
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

@Injectable()
export class ConversationService {
  constructor(
    private readonly repo: ConversationRepository,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async create(tenantId: string, dto: CreateConversationDto): Promise<Conversation> {
    return this.repo.create(tenantId, {
      contactId: dto.contactId,
      channel: dto.channel ?? 'WEBCHAT',
      status: 'OPEN',
      meta: { title: dto.title },
    });
  }

  findAll(tenantId: string): Promise<Conversation[]> {
    return this.repo.findAll(tenantId, { order: { lastMessageAt: 'DESC', createdAt: 'DESC' } });
  }

  async findPaginated(tenantId: string, page: number, limit: number) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await this.repo['repository'].findAndCount({
      where: { tenantId },
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
      skip,
      take: safeLimit,
    });

    return { items, total, page: safePage, limit: safeLimit };
  }

  async findOneWithMessages(
    tenantId: string,
    id: string,
  ): Promise<ConversationWithMessages | null> {
    const conversation = await this.repo.findById(tenantId, id);
    if (!conversation) {
      return null;
    }

    const messages = await this.messageRepo.find({
      where: { tenantId, conversationId: id },
      order: { createdAt: 'ASC' },
    });

    return { ...conversation, messages };
  }

  async addMessage(
    tenantId: string,
    conversationId: string,
    role: 'USER' | 'ASSISTANT' | 'SYSTEM',
    content: string,
  ): Promise<Message> {
    const conversation = await this.repo.findById(tenantId, conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const msg = await this.messageRepo.save(
      this.messageRepo.create({
        tenantId,
        conversationId,
        role,
        content,
        type: 'TEXT',
      }),
    );

    await this.repo.updateWithTenant(tenantId, conversationId, { lastMessageAt: new Date() });
    return msg;
  }

  async getMessages(tenantId: string, conversationId: string): Promise<Message[]> {
    const conversation = await this.repo.findById(tenantId, conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.messageRepo.find({
      where: { tenantId, conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const conversation = await this.repo.findById(tenantId, id);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.messageRepo.softDelete({ tenantId, conversationId: id });
    await this.repo.delete(tenantId, id);
  }

  async handoff(tenantId: string, id: string): Promise<Conversation> {
    const conversation = await this.repo.findById(tenantId, id);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.repo.updateWithTenant(tenantId, id, {
      status: 'PENDING',
      meta: { ...conversation.meta, handoffRequested: true, handoffAt: new Date().toISOString() },
    });
  }
}
