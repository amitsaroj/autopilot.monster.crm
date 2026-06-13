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

@Entity('wallet_transactions')
@Index(['tenantId', 'createdAt'])
export class WalletTransaction extends BaseEntity {
  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId!: string;

  @Column({
    type: 'enum',
    enum: ['CREDIT', 'DEBIT'],
  })
  type!: 'CREDIT' | 'DEBIT';

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['TOPUP', 'USAGE', 'REFUND', 'BONUS', 'ADJUSTMENT'],
    default: 'TOPUP',
  })
  source!: 'TOPUP' | 'USAGE' | 'REFUND' | 'BONUS' | 'ADJUSTMENT';

  @Column({ name: 'reference_id', type: 'varchar', nullable: true })
  referenceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
