import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('voice_calls')
@Index(['tenantId', 'sid'])
export class VoiceCall extends BaseEntity {
  @Column({ unique: true })
  sid!: string; // Twilio SID

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column({
    type: 'enum',
    enum: ['INBOUND', 'OUTBOUND'],
  })
  direction!: 'INBOUND' | 'OUTBOUND';

  @Column({ default: 'QUEUED' })
  status!: string;

  @Column({ name: 'duration_seconds', type: 'integer', default: 0 })
  durationSeconds!: number;

  @Column({ name: 'recording_url', nullable: true })
  recordingUrl?: string;

  @Column({ type: 'text', nullable: true })
  transcript?: string;

  @Column({ name: 'cost_amount', type: 'decimal', precision: 10, scale: 4, default: 0 })
  costAmount!: number;
}
