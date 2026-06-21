import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum WalletTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

@Entity('wallet_transactions')
@Index(['tenantId', 'walletId'])
export class WalletTransaction extends BaseEntity {
  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId!: string;

  @Column({ type: 'enum', enum: WalletTransactionType })
  type!: WalletTransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2 })
  balanceAfter!: number;

  @Column({ length: 255 })
  description!: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId?: string;
}
