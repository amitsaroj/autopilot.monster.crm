import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
@Entity('whatsapp_consents')
@Index(['tenantId', 'phone', 'createdAt'])
export class WhatsAppConsent extends BaseEntity {
  @Column({ length: 15 }) phone!: string;
  @Column({ length: 20 }) status!: 'OPTED_IN' | 'OPTED_OUT';
  @Column({ length: 20, default: 'ALL' }) scope!:
    | 'ALL'
    | 'MARKETING'
    | 'UTILITY'
    | 'AUTHENTICATION';
  @Column({ length: 200 }) source!: string;
  @Column({ type: 'text', nullable: true }) evidence?: string;
  @Column({ name: 'contact_id', type: 'uuid', nullable: true }) contactId?: string;
}
