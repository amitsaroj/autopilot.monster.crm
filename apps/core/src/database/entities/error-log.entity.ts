import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('error_logs')
export class ErrorLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column()
  message!: string;

  @Column({ type: 'text', nullable: true })
  stack?: string;

  @Column({ nullable: true })
  path?: string;

  @Column({ nullable: true })
  method?: string;

  @Column({ type: 'jsonb', nullable: true })
  context?: any;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;
}
