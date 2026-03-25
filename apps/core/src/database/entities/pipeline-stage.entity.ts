import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { Deal } from './deal.entity';

@Entity('pipeline_stages')
export class PipelineStage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: 0 })
  order!: number;

  @Column({ type: 'int', default: 0 })
  probability!: number;

  @Column({ name: 'pipeline_id' })
  pipelineId!: string;

  @ManyToOne(() => Pipeline, (pipeline) => pipeline.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pipeline_id' })
  pipeline!: Pipeline;

  @OneToMany(() => Deal, (deal) => deal.stage)
  deals!: Deal[];

  @Column()
  @Index()
  tenantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
