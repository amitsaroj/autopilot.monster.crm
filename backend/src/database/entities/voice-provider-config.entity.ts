import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('voice_provider_configs')
@Index(['tenantId', 'provider'], { unique: true })
export class VoiceProviderConfig extends BaseEntity {
  @Column() provider!: string;
  @Column({ select: false, type: 'text' }) credentials!: string;
  @Column({ type: 'jsonb', default: '{}' }) settings!: Record<string, any>;
}

@Entity('voice_suppressions')
@Index(['tenantId', 'phone'], { unique: true })
export class VoiceSuppression extends BaseEntity {
  @Column() phone!: string;
  @Column() reason!: string;
}

@Entity('voice_call_events')
@Index(['tenantId', 'eventKey'], { unique: true })
export class VoiceCallEvent extends BaseEntity {
  @Column({ name: 'call_id', type: 'uuid' }) callId!: string;
  @Column({ name: 'event_key' }) eventKey!: string;
  @Column({ type: 'jsonb' }) payload!: Record<string, any>;
  @Column({ default: false }) processed!: boolean;
  @Column({ type: 'text', nullable: true }) error?: string;
}
