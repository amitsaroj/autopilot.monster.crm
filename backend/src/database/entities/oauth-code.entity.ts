import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('oauth_codes')
export class OAuthCode {
  @PrimaryColumn({ length: 64 })
  code!: string;

  @Column({ name: 'client_id', length: 64 })
  clientId!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'redirect_uri', length: 500 })
  redirectUri!: string;

  @Column({ type: 'jsonb', default: '["*"]' })
  scopes!: string[];

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
