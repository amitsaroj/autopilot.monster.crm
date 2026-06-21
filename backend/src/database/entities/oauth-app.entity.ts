import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('oauth_apps')
@Index(['clientId'], { unique: true })
export class OAuthApp extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'client_id', length: 64, unique: true })
  clientId!: string;

  @Column({ name: 'client_secret', length: 128, nullable: true })
  clientSecret?: string;

  @Column({ name: 'client_secret_hash', nullable: true })
  clientSecretHash?: string;

  @Column({ name: 'client_secret_prefix', length: 16, nullable: true })
  clientSecretPrefix?: string;

  @Column({ name: 'redirect_uris', type: 'text', array: true, default: '{}' })
  redirectUris!: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  scopes!: string[];

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
