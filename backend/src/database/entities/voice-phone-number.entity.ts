import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum VoicePhoneNumberStatus {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
  PENDING = 'PENDING',
}

@Entity('voice_phone_numbers')
@Index(['tenantId', 'phoneNumber'], { unique: true })
export class VoicePhoneNumber extends BaseEntity {
  @Column({ name: 'phone_number', length: 30 })
  phoneNumber!: string;

  @Column({ length: 5 })
  country!: string;

  @Column({
    type: 'enum',
    enum: VoicePhoneNumberStatus,
    default: VoicePhoneNumberStatus.ACTIVE,
  })
  status!: VoicePhoneNumberStatus;

  @Column({ name: 'twilio_sid', nullable: true })
  twilioSid?: string;

  @Column({ type: 'jsonb', default: '{}' })
  capabilities!: { voice: boolean; sms: boolean; mms: boolean };
}
