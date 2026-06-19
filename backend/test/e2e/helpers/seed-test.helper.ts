import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';

import { Tenant } from '../../../src/database/entities/tenant.entity';
import { UserEntity, UserStatus } from '../../../src/modules/auth/entities/user.entity';
import { Role } from '../../../src/database/entities/role.entity';
import { Permission } from '../../../src/database/entities/permission.entity';
import { UserRole } from '../../../src/database/entities/user-role.entity';
import { Plan } from '../../../src/database/entities/plan.entity';
import { PlanFeature } from '../../../src/database/entities/plan-feature.entity';
import { PlanLimit } from '../../../src/database/entities/plan-limit.entity';
import { Subscription } from '../../../src/database/entities/subscription.entity';
import { Wallet } from '../../../src/database/entities/wallet.entity';

export interface TestCredentials {
  tenantId: string;
  email: string;
  password: string;
}

export interface CrossTenantTestCredentials {
  primary: TestCredentials;
  secondary: TestCredentials;
}

const E2E_MANAGE_RESOURCES = [
  'crm',
  'workflow',
  'workflows',
  'analytics',
  'billing',
  'ai',
  'voice',
  'whatsapp',
  'settings',
  'users',
  'storage',
  'search',
  'support',
  'social',
  'plugins',
  'marketplace',
  'integrations',
  'notifications',
  'platform',
  'tenant',
  'scheduler',
  'data-jobs',
  'rbac',
  'audit',
] as const;

const E2E_PERMISSIONS = E2E_MANAGE_RESOURCES.map((resource) => ({
  name: `${resource}:manage`,
  resource,
  action: 'manage',
}));

const E2E_PLAN_FEATURES = ['workflow', 'crm', 'analytics', 'import', 'export', 'storage', 'billing', 'ai', 'voice', 'whatsapp'];

async function ensurePermissions(dataSource: DataSource): Promise<Permission[]> {
  const permissionRepo = dataSource.getRepository(Permission);
  const permissions: Permission[] = [];

  for (const definition of E2E_PERMISSIONS) {
    let permission = await permissionRepo.findOne({ where: { name: definition.name } });
    if (!permission) {
      permission = await permissionRepo.save(permissionRepo.create(definition));
    }
    permissions.push(permission);
  }

  return permissions;
}

async function ensureTenantAdminRole(
  dataSource: DataSource,
  tenantId: string,
  permissions: Permission[],
): Promise<Role> {
  const roleRepo = dataSource.getRepository(Role);
  let role = await roleRepo.findOne({
    where: { tenantId, name: 'TENANT_ADMIN' },
    relations: ['permissions'],
  });

  if (!role) {
    role = await roleRepo.save(
      roleRepo.create({
        tenantId,
        name: 'TENANT_ADMIN',
        description: 'E2E tenant administrator',
        isSystem: true,
        permissions,
      }),
    );
    return role;
  }

  role.permissions = permissions;
  return roleRepo.save(role);
}

async function ensureUserRole(
  dataSource: DataSource,
  tenantId: string,
  userId: string,
  roleId: string,
): Promise<void> {
  const userRoleRepo = dataSource.getRepository(UserRole);
  const existing = await userRoleRepo.findOne({ where: { userId, tenantId, roleId } });
  if (!existing) {
    await userRoleRepo.save(userRoleRepo.create({ userId, tenantId, roleId }));
  }
}

async function ensureSubscription(dataSource: DataSource, tenantId: string): Promise<void> {
  const planRepo = dataSource.getRepository(Plan);
  const featureRepo = dataSource.getRepository(PlanFeature);
  const subscriptionRepo = dataSource.getRepository(Subscription);

  let plan = await planRepo.findOne({ where: { slug: 'e2e-enterprise' } });
  if (!plan) {
    plan = await planRepo.save(
      planRepo.create({
        name: 'E2E Enterprise',
        slug: 'e2e-enterprise',
        priceMonthly: 0,
        priceAnnual: 0,
        currency: 'USD',
        status: 'ACTIVE',
      }),
    );
  }

  for (const featureKey of E2E_PLAN_FEATURES) {
    const existingFeature = await featureRepo.findOne({ where: { planId: plan.id, featureKey } });
    if (!existingFeature) {
      await featureRepo.save(
        featureRepo.create({
          planId: plan.id,
          featureKey,
          enabled: true,
        }),
      );
    } else if (!existingFeature.enabled) {
      existingFeature.enabled = true;
      await featureRepo.save(existingFeature);
    }
  }

  const limitRepo = dataSource.getRepository(PlanLimit);
  const e2eLimits = [
    { metric: 'contacts_limit', value: 10000, period: 'TOTAL' as const },
    { metric: 'deals_limit', value: 10000, period: 'TOTAL' as const },
  ];
  for (const limitDef of e2eLimits) {
    const existingLimit = await limitRepo.findOne({
      where: { planId: plan.id, metric: limitDef.metric },
    });
    if (!existingLimit) {
      await limitRepo.save(
        limitRepo.create({
          planId: plan.id,
          metric: limitDef.metric,
          value: limitDef.value,
          period: limitDef.period,
        }),
      );
    }
  }

  const existingSubscription = await subscriptionRepo.findOne({
    where: { tenantId, status: 'ACTIVE' },
  });
  if (!existingSubscription) {
    await subscriptionRepo.save(
      subscriptionRepo.create({
        tenantId,
        planId: plan.id,
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
      }),
    );
  }
}

export async function seedTestCredentials(): Promise<TestCredentials> {
  return seedTenantCredentials('e2e-test', 'E2E Test Tenant', 'e2e-user@autopilotmonster.com');
}

async function seedTenantCredentials(
  slug: string,
  name: string,
  email: string,
): Promise<TestCredentials> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'autopilot_monster',
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'password',
    entities: [Tenant, UserEntity, Role, Permission, UserRole, Plan, PlanFeature, PlanLimit, Subscription],
    synchronize: false,
  });

  await dataSource.initialize();

  const tenantRepo = dataSource.getRepository(Tenant);
  const userRepo = dataSource.getRepository(UserEntity);

  let tenant = await tenantRepo.findOne({ where: { slug } });
  if (!tenant) {
    tenant = await tenantRepo.save(
      tenantRepo.create({ name, slug, status: 'ACTIVE' }),
    );
  }

  const password = 'E2eTestP@ssw0rd!';

  let user = await userRepo.findOne({ where: { email, tenantId: tenant.id } });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await userRepo.save(
      userRepo.create({
        email,
        firstName: 'E2E',
        lastName: 'User',
        tenantId: tenant.id,
        passwordHash,
        status: UserStatus.ACTIVE,
      }),
    );
  }

  const permissions = await ensurePermissions(dataSource);
  const role = await ensureTenantAdminRole(dataSource, tenant.id, permissions);
  await ensureUserRole(dataSource, tenant.id, user.id, role.id);
  await ensureSubscription(dataSource, tenant.id);

  await dataSource.destroy();

  return { tenantId: tenant.id, email, password };
}

export async function seedCrossTenantCredentials(): Promise<CrossTenantTestCredentials> {
  const primary = await seedTenantCredentials(
    'e2e-test',
    'E2E Test Tenant',
    'e2e-user@autopilotmonster.com',
  );
  const secondary = await seedTenantCredentials(
    'e2e-test-b',
    'E2E Test Tenant B',
    'e2e-user-b@autopilotmonster.com',
  );
  return { primary, secondary };
}

export async function seedWalletBalance(tenantId: string, balance: number): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'autopilot_monster',
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'password',
    entities: [Wallet],
    synchronize: false,
  });

  await dataSource.initialize();
  const walletRepo = dataSource.getRepository(Wallet);

  let wallet = await walletRepo.findOne({ where: { tenantId } });
  if (!wallet) {
    wallet = walletRepo.create({ tenantId, balance, currency: 'USD' });
  } else {
    wallet.balance = balance;
  }
  await walletRepo.save(wallet);
  await dataSource.destroy();
}
