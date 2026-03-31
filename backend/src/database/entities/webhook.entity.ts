import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('webhooks')
export class Webhook extends BaseEntity {
  @Column()
  name!: string;

  @Column({ length: 500 })
  url!: string;

  @Column({ nullable: true })
  secret?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  events!: string[];

  @Column({ default: 'ACTIVE' })
  status!: string;

  @Column({ name: 'last_success_at', type: 'timestamptz', nullable: true })
  lastSuccessAt?: Date;

  @Column({ name: 'last_failure_at', type: 'timestamptz', nullable: true })
  lastFailureAt?: Date;

  @Column({ name: 'failure_count', default: 0 })
  failureCount!: number;
}
