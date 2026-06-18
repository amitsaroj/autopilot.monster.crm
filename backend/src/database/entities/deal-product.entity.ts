import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Deal } from './deal.entity';
import { Product } from './product.entity';

@Entity('deal_products')
@Index(['tenantId', 'dealId', 'productId'], { unique: true })
export class DealProduct extends BaseEntity {
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @ManyToOne(() => Deal)
  @JoinColumn({ name: 'deal_id' })
  deal!: Deal;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'integer', default: 1 })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2, default: 0 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount!: number;
}
