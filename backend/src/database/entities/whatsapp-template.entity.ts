import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum WhatsAppTemplateCategory {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION',
}

export enum WhatsAppTemplateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('whatsapp_templates')
@Index(['tenantId', 'name'])
export class WhatsAppTemplate extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: WhatsAppTemplateCategory,
    default: WhatsAppTemplateCategory.UTILITY,
  })
  category!: WhatsAppTemplateCategory;

  @Column({ length: 10, default: 'en_US' })
  language!: string;

  @Column({ type: 'jsonb', default: '{}' })
  components!: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: WhatsAppTemplateStatus,
    default: WhatsAppTemplateStatus.PENDING,
  })
  status!: WhatsAppTemplateStatus;

  @Column({ name: 'wa_template_id', nullable: true })
  waTemplateId?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;
}
