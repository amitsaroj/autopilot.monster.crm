import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VoicePhoneNumber, VoicePhoneNumberStatus } from '../../database/entities/voice-phone-number.entity';
import { TwilioService } from './twilio.service';
import { ProvisionPhoneNumberDto } from './dto/voice-phone-number.dto';

@Injectable()
export class VoicePhoneNumberService {
  constructor(
    @InjectRepository(VoicePhoneNumber)
    private readonly phoneRepository: Repository<VoicePhoneNumber>,
    private readonly twilioService: TwilioService,
  ) {}

  findAll(tenantId: string): Promise<VoicePhoneNumber[]> {
    return this.phoneRepository.find({
      where: { tenantId, status: VoicePhoneNumberStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async provision(tenantId: string, dto: ProvisionPhoneNumberDto): Promise<VoicePhoneNumber> {
    const existing = await this.phoneRepository.findOne({
      where: { tenantId, phoneNumber: dto.phoneNumber },
    });
    if (existing && existing.status === VoicePhoneNumberStatus.ACTIVE) {
      throw new BadRequestException('Phone number already provisioned');
    }

    const twilioSid = await this.twilioService.purchasePhoneNumber(tenantId, dto.phoneNumber);

    return this.phoneRepository.save(
      this.phoneRepository.create({
        tenantId,
        phoneNumber: dto.phoneNumber,
        country: dto.country,
        twilioSid,
        status: VoicePhoneNumberStatus.ACTIVE,
        capabilities: dto.capabilities ?? { voice: true, sms: true, mms: false },
      }),
    );
  }

  async release(tenantId: string, id: string): Promise<void> {
    const number = await this.phoneRepository.findOne({ where: { id, tenantId } });
    if (!number) {
      throw new NotFoundException('Phone number not found');
    }

    if (number.twilioSid) {
      await this.twilioService.releasePhoneNumber(tenantId, number.twilioSid);
    }

    number.status = VoicePhoneNumberStatus.RELEASED;
    await this.phoneRepository.save(number);
  }
}
