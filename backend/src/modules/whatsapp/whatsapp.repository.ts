import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseRepository } from '../../database/base.repository';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';

@Injectable()
export class WhatsappMessageRepository extends BaseRepository<WhatsAppMessage> {
  constructor(
    @InjectRepository(WhatsAppMessage)
    whatsappRepo: Repository<WhatsAppMessage>,
  ) {
    super(whatsappRepo);
  }

  async findConversation(tenantId: string, phone: string): Promise<WhatsAppMessage[]> {
    return this.repository.find({
      where: [
        { tenantId, from: phone },
        { tenantId, to: phone },
      ],
      order: { createdAt: 'ASC' },
    });
  }
}
