import { Entity, Column } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('oauth_apps')
export class OAuthApp extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'client_id', length: 64, unique: true })
  clientId!: string;

  @Column({ name: 'client_secret_hash' })
  clientSecretHash!: string;

  @Column({ name: 'client_secret_prefix', length: 16 })
  clientSecretPrefix!: string;

  @Column({ name: 'redirect_uris', type: 'text', array: true, default: '{}' })
  redirectUris!: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  scopes!: string[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
