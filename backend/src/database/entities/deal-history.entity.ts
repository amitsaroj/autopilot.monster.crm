import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Deal } from './deal.entity';
import { PipelineStage } from './pipeline-stage.entity';

@Entity('deal_histories')
@Index(['tenantId', 'dealId'])
export class DealHistory extends BaseEntity {
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal!: Deal;

  @Column({ name: 'old_stage_id', type: 'uuid', nullable: true })
  oldStageId?: string;

  @ManyToOne(() => PipelineStage, { nullable: true })
  @JoinColumn({ name: 'old_stage_id' })
  oldStage?: PipelineStage;

  @Column({ name: 'new_stage_id', type: 'uuid' })
  newStageId!: string;

  @ManyToOne(() => PipelineStage)
  @JoinColumn({ name: 'new_stage_id' })
  newStage!: PipelineStage;

  @Column({ name: 'changed_by_id', type: 'uuid', nullable: true })
  changedById?: string;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valueAtChange?: number;

  @Column({ type: 'integer', nullable: true })
  probabilityAtChange?: number;

  @Column()
  @Index()
  tenantId!: string;
}
