import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class ConversationRepository extends BaseRepository<Conversation> {
  constructor(@InjectRepository(Conversation) repo: Repository<Conversation>) {
    super(repo);
  }
}

@Injectable()
export class ConversationService {
  constructor(
    private readonly repo: ConversationRepository,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  async findAll(tid: string) {
    return this.repo.findAll(tid);
  }

  async addMessage(
    tid: string,
    cid: string,
    role: 'USER' | 'ASSISTANT' | 'SYSTEM',
    content: string,
  ) {
    const msg = this.messageRepo.create({
      tenantId: tid,
      conversationId: cid,
      role,
      content,
    } as any);
    await this.messageRepo.save(msg);
    await this.repo.updateWithTenant(tid, cid, { lastMessageAt: new Date() } as any);
    return msg;
  }

  async getMessages(cid: string) {
    return this.messageRepo.find({ where: { conversationId: cid }, order: { createdAt: 'ASC' } });
  }
}
