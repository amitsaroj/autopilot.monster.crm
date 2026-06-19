import { AppDataSource } from '../database/data-source';
import { UserEntity, UserStatus } from '../modules/auth/entities/user.entity';
import { Tenant } from '../database/entities/tenant.entity';
import { Role } from '../database/entities/role.entity';
import { Permission } from '../database/entities/permission.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { Plan } from '../database/entities/plan.entity';
import { PlanFeature } from '../database/entities/plan-feature.entity';
import { PlanLimit } from '../database/entities/plan-limit.entity';
import { PlatformSetting } from '../database/entities/platform-setting.entity';
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from '../common/constants/permission-resources.constants';
import * as bcrypt from 'bcryptjs';

import { seedDemoCrmData, seedDemoSubscription } from './seed-demo-data';
import { seedMarketplacePlugins } from './seed-marketplace-plugins';

const DEMO_PASSWORD = 'SecureP@ssw0rd!';

async function seed() {
  console.log('Starting seed process...');
  await AppDataSource.initialize();
  console.log('Database connected.');

  const tenantRepo = AppDataSource.getRepository(Tenant);
  const userRepo = AppDataSource.getRepository(UserEntity);
  const roleRepo = AppDataSource.getRepository(Role);
  const permRepo = AppDataSource.getRepository(Permission);
  const userRoleRepo = AppDataSource.getRepository(UserRole);
  const planRepo = AppDataSource.getRepository(Plan);
  const featureRepo = AppDataSource.getRepository(PlanFeature);
  const limitRepo = AppDataSource.getRepository(PlanLimit);
  const platformSettingRepo = AppDataSource.getRepository(PlatformSetting);

  try {
    // 1. DEFAULT TENANT
    let defaultTenant = await tenantRepo.findOneBy({ slug: 'default' });
    if (!defaultTenant) {
      defaultTenant = tenantRepo.create({
        name: 'Default Workspace',
        slug: 'default',
        status: 'ACTIVE',
      });
      await tenantRepo.save(defaultTenant);
      console.log('Created Default Tenant');
    } else {
      console.log('Default Tenant already exists');
    }

    // 2. PERMISSIONS
    const allPermissions: Permission[] = [];
    for (const action of PERMISSION_ACTIONS) {
      for (const resource of PERMISSION_RESOURCES) {
        const name = `${resource}:${action}`;
        let perm = await permRepo.findOneBy({ name });
        if (!perm) {
          perm = permRepo.create({ name, resource, action, description: `Can ${action} ${resource}` });
          await permRepo.save(perm);
        }
        allPermissions.push(perm);
      }
    }
    console.log(`Verified ${allPermissions.length} permissions`);

    // 3. ROLES (and map permissions)
    const roleMappings = [
      { name: 'SUPER_ADMIN', perms: allPermissions },
      { name: 'TENANT_ADMIN', perms: allPermissions.filter((p) => p.resource !== 'admin') },
      { name: 'MANAGER', perms: allPermissions.filter((p) => !['admin', 'billing'].includes(p.resource) && p.action !== 'delete') },
      { name: 'USER', perms: allPermissions.filter((p) => ['read', 'create', 'update', 'view'].includes(p.action) && !['admin', 'billing', 'settings'].includes(p.resource)) },
      { name: 'AGENT', perms: allPermissions.filter((p) => ['read', 'view', 'create', 'update'].includes(p.action) && ['crm', 'voice', 'whatsapp'].includes(p.resource)) },
    ];

    const rolesMap = new Map<string, Role>();
    for (const mapping of roleMappings) {
      let role = await roleRepo.findOne({ where: { name: mapping.name, tenantId: defaultTenant.id }, relations: ['permissions'] });
      if (!role) {
        role = roleRepo.create({ name: mapping.name, isSystem: true, tenantId: defaultTenant.id, permissions: mapping.perms });
        await roleRepo.save(role);
        console.log(`Created Role: ${mapping.name}`);
      } else {
        // Sync permissions implicitly
        role.permissions = mapping.perms;
        await roleRepo.save(role);
      }
      rolesMap.set(mapping.name, role);
    }

    // 4. PLANS, FEATURES, LIMITS
    const plansData = [
      { name: 'Free', slug: 'FREE', priceMonthly: 0, priceAnnual: 0, limitContacts: 100, limitUsers: 1, limitAiTokens: 1000, features: ['crm', 'analytics', 'billing'], stripePriceIdMonthly: null, stripePriceIdAnnual: null },
      { name: 'Starter', slug: 'STARTER', priceMonthly: 29, priceAnnual: 290, limitContacts: 1000, limitUsers: 5, limitAiTokens: 50000, features: ['crm', 'analytics', 'workflow', 'whatsapp', 'billing', 'export'], stripePriceIdMonthly: 'price_starter_monthly_placeholder', stripePriceIdAnnual: 'price_starter_annual_placeholder' },
      { name: 'Pro', slug: 'PRO', priceMonthly: 99, priceAnnual: 990, limitContacts: 10000, limitUsers: 20, limitAiTokens: 500000, features: ['crm', 'analytics', 'workflow', 'whatsapp', 'ai', 'voice', 'plugins', 'billing', 'storage', 'export', 'import'], stripePriceIdMonthly: 'price_pro_monthly_placeholder', stripePriceIdAnnual: 'price_pro_annual_placeholder' },
      { name: 'Enterprise', slug: 'ENTERPRISE', priceMonthly: 499, priceAnnual: 4990, limitContacts: -1, limitUsers: -1, limitAiTokens: -1, features: ['crm', 'analytics', 'workflow', 'whatsapp', 'ai', 'voice', 'plugins', 'marketplace', 'billing', 'storage', 'export', 'import'], stripePriceIdMonthly: 'price_ent_monthly_placeholder', stripePriceIdAnnual: 'price_ent_annual_placeholder' },
    ];

    for (const pd of plansData) {
      let plan = await planRepo.findOneBy({ slug: pd.slug });
      if (!plan) {
        plan = planRepo.create({
          name: pd.name,
          slug: pd.slug,
          priceMonthly: pd.priceMonthly,
          priceAnnual: pd.priceAnnual,
          currency: 'USD',
          status: 'ACTIVE',
          stripePriceIdMonthly: pd.stripePriceIdMonthly as string,
          stripePriceIdAnnual: pd.stripePriceIdAnnual as string,
        });
        await planRepo.save(plan);
        console.log(`Created Plan: ${pd.name}`);
        
        // Limits
        await limitRepo.save([
          limitRepo.create({ planId: plan.id, metric: 'contacts_limit', value: pd.limitContacts, period: 'TOTAL' }),
          limitRepo.create({ planId: plan.id, metric: 'deals_limit', value: pd.limitContacts, period: 'TOTAL' }),
          limitRepo.create({ planId: plan.id, metric: 'users_limit', value: pd.limitUsers, period: 'TOTAL' }),
          limitRepo.create({ planId: plan.id, metric: 'ai_tokens', value: pd.limitAiTokens, period: 'MONTHLY' }),
          limitRepo.create({ planId: plan.id, metric: 'workflow_runs', value: pd.limitUsers === -1 ? -1 : pd.limitUsers * 500, period: 'MONTHLY' }),
          limitRepo.create({ planId: plan.id, metric: 'calls', value: pd.limitUsers === -1 ? -1 : pd.limitUsers * 100, period: 'MONTHLY' }),
          limitRepo.create({ planId: plan.id, metric: 'messages', value: pd.limitUsers === -1 ? -1 : pd.limitUsers * 1000, period: 'MONTHLY' }),
        ]);

        // Features
        const featuresEnts = pd.features.map(f => featureRepo.create({ planId: plan!.id, featureKey: f, enabled: true, config: {} }));
        await featureRepo.save(featuresEnts);
      }
    }

    // 5. USERS (SuperAdmin & Admin)
    const usersToCreate = [
      { key: 'superadmin', email: 'superadmin@autopilotmonster.com', role: 'SUPER_ADMIN', firstName: 'Super', lastName: 'Admin' },
      { key: 'admin', email: 'admin@autopilotmonster.com', role: 'TENANT_ADMIN', firstName: 'System', lastName: 'Admin' },
      { key: 'manager', email: 'manager@autopilotmonster.com', role: 'USER', firstName: 'Sales', lastName: 'Manager' },
      { key: 'user', email: 'user@autopilotmonster.com', role: 'USER', firstName: 'Staff', lastName: 'Member' },
      { key: 'agent', email: 'agent@autopilotmonster.com', role: 'USER', firstName: 'Support', lastName: 'Agent' },
    ];

    const demoUsers: Record<string, UserEntity> = {};
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    for (const ud of usersToCreate) {
      let user = await userRepo.findOneBy({ email: ud.email, tenantId: defaultTenant.id });
      if (!user) {
        user = userRepo.create({
          email: ud.email,
          firstName: ud.firstName,
          lastName: ud.lastName,
          tenantId: defaultTenant.id,
          passwordHash,
          status: UserStatus.ACTIVE,
        });
        await userRepo.save(user);
        console.log(`Created User: ${ud.email}`);
      } else {
        user.passwordHash = passwordHash;
        user.status = UserStatus.ACTIVE;
        await userRepo.save(user);
        console.log(`Updated User: ${ud.email}`);
      }

      demoUsers[ud.key] = user;

      const role = rolesMap.get(ud.role);
      if (role) {
        const existingAssignment = await userRoleRepo.findOne({
          where: { userId: user.id, roleId: role.id, tenantId: defaultTenant.id },
        });
        if (!existingAssignment) {
          await userRoleRepo.save(
            userRoleRepo.create({ userId: user.id, roleId: role.id, tenantId: defaultTenant.id }),
          );
        }
      }

      if (ud.key === 'agent') {
        const agentRole = rolesMap.get('AGENT');
        if (agentRole) {
          const existingAgentRole = await userRoleRepo.findOne({
            where: { userId: user.id, roleId: agentRole.id, tenantId: defaultTenant.id },
          });
          if (!existingAgentRole) {
            await userRoleRepo.save(
              userRoleRepo.create({ userId: user.id, roleId: agentRole.id, tenantId: defaultTenant.id }),
            );
          }
        }
      }
    }

    // 6. SYSTEM CONFIG / FEATURE FLAGS
    const globalFeatureFlags = [
      'crm',
      'analytics',
      'workflow',
      'whatsapp',
      'ai',
      'voice',
      'plugins',
      'marketplace',
      'billing',
      'storage',
      'export',
      'import',
    ];

    for (const featureKey of globalFeatureFlags) {
      let platSet = await platformSettingRepo.findOne({
        where: { key: featureKey, group: 'FEATURE_FLAGS' },
      });
      if (!platSet) {
        platSet = platformSettingRepo.create({
          key: featureKey,
          value: true,
          group: 'FEATURE_FLAGS',
          isPublic: true,
        });
        await platformSettingRepo.save(platSet);
      }
    }
    console.log('Global feature flags verified.');

    await seedDemoSubscription(AppDataSource, defaultTenant.id);
    await seedMarketplacePlugins(AppDataSource, defaultTenant.id);
    await seedDemoCrmData(AppDataSource, defaultTenant.id, {
      superadmin: demoUsers.superadmin,
      admin: demoUsers.admin,
      manager: demoUsers.manager,
      user: demoUsers.user,
      agent: demoUsers.agent,
    });

    console.log('Seed completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Error during seed:', err);
    process.exit(1);
  }
}

seed();
