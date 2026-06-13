import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('oauth_apps')
@Index(['clientId'], { unique: true })
export class OAuthApp extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'client_id', length: 64 })
  clientId!: string;

  @Column({ name: 'client_secret', length: 128 })
  clientSecret!: string;

  @Column({ name: 'redirect_uris', type: 'jsonb', default: '[]' })
  redirectUris!: string[];

  @Column({ type: 'jsonb', default: '["*"]' })
  scopes!: string[];

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
