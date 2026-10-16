import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('whatsapp_template_history')
@Index(['tenantId', 'templateId', 'createdAt'])
export class WhatsAppTemplateHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'template_id' })
  templateId!: string;

  @Column({ type: 'varchar', length: 32 })
  source!: string;

  @Column({ type: 'uuid', name: 'actor_id', nullable: true })
  actorId?: string | null;

  @Column({ type: 'jsonb' })
  snapshot!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
