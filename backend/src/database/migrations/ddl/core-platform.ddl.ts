import type { QueryRunner } from 'typeorm';

import { createEnumType, runQueries } from './migration-utils';

const PLATFORM_QUERIES: string[] = [
  createEnumType('tenants_status_enum', ['ACTIVE', 'SUSPENDED', 'TRIAL', 'DELETED']),
  createEnumType('users_provider_enum', ['local', 'google', 'facebook', 'github', 'apple']),
  createEnumType('users_status_enum', ['active', 'inactive', 'suspended', 'pending_verification']),
  createEnumType('plan_limits_period_enum', ['DAILY', 'MONTHLY', 'TOTAL']),
  createEnumType('invitations_status_enum', ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED']),

  `CREATE TABLE IF NOT EXISTS tenants (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar NOT NULL,
    slug varchar NOT NULL UNIQUE,
    status "tenants_status_enum" NOT NULL DEFAULT 'TRIAL',
    plan_id varchar,
    custom_domain varchar,
    branding jsonb,
    overrides jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    email varchar(255) NOT NULL,
    password_hash varchar(255),
    provider "users_provider_enum" NOT NULL DEFAULT 'local',
    provider_id varchar(255),
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    status "users_status_enum" NOT NULL DEFAULT 'pending_verification',
    is_mfa_enabled boolean NOT NULL DEFAULT false,
    mfa_secret varchar(64),
    last_login_at timestamptz,
    failed_login_attempts integer NOT NULL DEFAULT 0,
    locked_until timestamptz,
    email_verified_at timestamptz,
    avatar_url varchar(512),
    verification_token varchar(128),
    reset_token varchar(128),
    reset_token_expires_at timestamptz,
    metadata jsonb
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_tenant ON users(email, tenant_id)`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider)`,
  `CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id)`,

  `CREATE TABLE IF NOT EXISTS sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    user_id uuid NOT NULL,
    ip_address varchar(45) NOT NULL,
    user_agent text,
    device_type varchar(50),
    is_active boolean NOT NULL DEFAULT true,
    expires_at timestamptz NOT NULL,
    last_activity_at timestamptz,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user_tenant ON sessions(user_id, tenant_id)`,

  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    user_id uuid NOT NULL,
    token_hash varchar(255) NOT NULL,
    session_id uuid,
    is_revoked boolean NOT NULL DEFAULT false,
    expires_at timestamptz NOT NULL,
    ip_address varchar(45),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_tenant ON refresh_tokens(user_id, tenant_id)`,

  `CREATE TABLE IF NOT EXISTS permissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar NOT NULL UNIQUE,
    description varchar,
    resource varchar NOT NULL,
    action varchar NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    name varchar NOT NULL,
    description varchar,
    is_system boolean NOT NULL DEFAULT false
  )`,

  `CREATE TABLE IF NOT EXISTS role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS user_roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    assigned_by uuid
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique ON user_roles(user_id, role_id, tenant_id)`,

  `CREATE TABLE IF NOT EXISTS tenant_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id varchar NOT NULL,
    key varchar(100) NOT NULL,
    value jsonb NOT NULL,
    "group" varchar(50) NOT NULL DEFAULT 'GENERAL',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_settings_key ON tenant_settings(tenant_id, key)`,

  `CREATE TABLE IF NOT EXISTS plans (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    description text,
    price_monthly decimal(10,2) NOT NULL,
    price_annual decimal(10,2) NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'USD',
    status varchar NOT NULL DEFAULT 'ACTIVE',
    is_public boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    stripe_price_id_monthly varchar,
    stripe_price_id_annual varchar,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS plan_features (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id uuid NOT NULL,
    feature_key varchar(100) NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    config jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT fk_plan_features_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS plan_limits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id uuid NOT NULL,
    metric varchar(100) NOT NULL,
    value bigint NOT NULL,
    period "plan_limits_period_enum" NOT NULL DEFAULT 'MONTHLY',
    CONSTRAINT fk_plan_limits_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS invitations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email varchar NOT NULL,
    tenant_id uuid NOT NULL,
    role_id uuid NOT NULL,
    token varchar NOT NULL UNIQUE,
    status "invitations_status_enum" NOT NULL DEFAULT 'PENDING',
    invited_by uuid NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
  )`,
  `CREATE INDEX IF NOT EXISTS idx_invitations_tenant ON invitations(tenant_id)`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    user_id uuid,
    action varchar(100) NOT NULL,
    resource varchar(100) NOT NULL,
    resource_id varchar,
    changes jsonb NOT NULL DEFAULT '{}',
    ip_address varchar(45),
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action ON audit_logs(tenant_id, action)`,
];

const PLATFORM_DOWN_QUERIES: string[] = [
  'DROP TABLE IF EXISTS audit_logs',
  'DROP TABLE IF EXISTS invitations',
  'DROP TABLE IF EXISTS plan_limits',
  'DROP TABLE IF EXISTS plan_features',
  'DROP TABLE IF EXISTS plans',
  'DROP TABLE IF EXISTS tenant_settings',
  'DROP TABLE IF EXISTS user_roles',
  'DROP TABLE IF EXISTS role_permissions',
  'DROP TABLE IF EXISTS roles',
  'DROP TABLE IF EXISTS permissions',
  'DROP TABLE IF EXISTS refresh_tokens',
  'DROP TABLE IF EXISTS sessions',
  'DROP TABLE IF EXISTS users',
  'DROP TABLE IF EXISTS tenants',
  'DROP TYPE IF EXISTS invitations_status_enum',
  'DROP TYPE IF EXISTS plan_limits_period_enum',
  'DROP TYPE IF EXISTS users_status_enum',
  'DROP TYPE IF EXISTS users_provider_enum',
  'DROP TYPE IF EXISTS tenants_status_enum',
];

export async function upCorePlatform(queryRunner: QueryRunner): Promise<void> {
  await runQueries(queryRunner, PLATFORM_QUERIES);
}

export async function downCorePlatform(queryRunner: QueryRunner): Promise<void> {
  await runQueries(queryRunner, PLATFORM_DOWN_QUERIES);
}
