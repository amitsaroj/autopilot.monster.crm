import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('pipelines')
export class Pipeline extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'jsonb', default: '[]' })
  stages!: Array<{
    id: string;
    name: string;
    probability: number;
    sortOrder: number;
  }>;
}
