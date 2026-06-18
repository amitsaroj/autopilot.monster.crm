import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseRepository } from '../../database/base.repository';
import { VoiceCall } from '../../database/entities/voice-call.entity';

@Injectable()
export class VoiceCallRepository extends BaseRepository<VoiceCall> {
  constructor(
    @InjectRepository(VoiceCall)
    voiceCallRepo: Repository<VoiceCall>,
  ) {
    super(voiceCallRepo);
  }

  async findBySid(tenantId: string, sid: string): Promise<VoiceCall | null> {
    return this.repository.findOne({ where: { tenantId, sid } });
  }

  async findBySidGlobal(sid: string): Promise<VoiceCall | null> {
    return this.repository.findOne({ where: { sid } });
  }
}
