import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { PipelineStage } from './pipeline-stage.entity';
import { Deal } from './deal.entity';

@Entity('pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: 0 })
  order!: number;

  @OneToMany(() => PipelineStage, (stage) => stage.pipeline, { cascade: true })
  stages!: PipelineStage[];

  @OneToMany(() => Deal, (deal) => deal.pipeline)
  deals!: Deal[];

  @Column()
  @Index()
  tenantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
