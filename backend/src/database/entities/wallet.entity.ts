import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('wallets')
@Index(['tenantId'], { unique: true })
export class Wallet extends BaseEntity {
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'total_credited', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCredited!: number;

  @Column({ name: 'total_debited', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDebited!: number;
}
