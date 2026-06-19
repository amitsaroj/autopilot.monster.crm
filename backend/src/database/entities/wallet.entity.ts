import { Entity, Column } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('wallets')
export class Wallet extends BaseEntity {
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;
}
