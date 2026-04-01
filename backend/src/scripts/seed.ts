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
import * as bcrypt from 'bcryptjs';

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
    const actions = ['create', 'read', 'update', 'delete', 'manage', 'view', 'execute'];
    const resources = ['users', 'crm', 'billing', 'workflow', 'ai', 'voice', 'whatsapp', 'analytics', 'settings', 'admin'];
    
    const allPermissions: Permission[] = [];
    for (const action of actions) {
      for (const resource of resources) {
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
      { name: 'ADMIN', perms: allPermissions.filter(p => p.resource !== 'admin') }, // Admins get nearly everything
      { name: 'MANAGER', perms: allPermissions.filter(p => !['admin', 'billing'].includes(p.resource) && p.action !== 'delete') },
      { name: 'USER', perms: allPermissions.filter(p => ['read', 'create', 'update', 'view'].includes(p.action) && !['admin', 'billing', 'settings'].includes(p.resource)) },
      { name: 'AGENT', perms: allPermissions.filter(p => ['read', 'view'].includes(p.action) && ['crm', 'voice', 'whatsapp'].includes(p.resource)) },
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
      { name: 'Free', slug: 'FREE', priceMonthly: 0, priceAnnual: 0, limitContacts: 100, limitUsers: 1, limitAiTokens: 1000, features: ['crm', 'analytics'] },
      { name: 'Starter', slug: 'STARTER', priceMonthly: 29, priceAnnual: 290, limitContacts: 1000, limitUsers: 5, limitAiTokens: 50000, features: ['crm', 'analytics', 'workflow', 'whatsapp'] },
      { name: 'Pro', slug: 'PRO', priceMonthly: 99, priceAnnual: 990, limitContacts: 10000, limitUsers: 20, limitAiTokens: 500000, features: ['crm', 'analytics', 'workflow', 'whatsapp', 'ai', 'voice', 'plugins'] },
      { name: 'Enterprise', slug: 'ENTERPRISE', priceMonthly: 499, priceAnnual: 4990, limitContacts: -1, limitUsers: -1, limitAiTokens: -1, features: ['crm', 'analytics', 'workflow', 'whatsapp', 'ai', 'voice', 'plugins', 'marketplace'] },
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
        });
        await planRepo.save(plan);
        console.log(`Created Plan: ${pd.name}`);
        
        // Limits
        await limitRepo.save([
          limitRepo.create({ planId: plan.id, metric: 'contacts_limit', value: pd.limitContacts, period: 'TOTAL' }),
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
      { email: 'superadmin@autopilotmonster.com', role: 'SUPER_ADMIN', firstName: 'Super', lastName: 'Admin' },
      { email: 'admin@autopilotmonster.com', role: 'ADMIN', firstName: 'System', lastName: 'Admin' },
    ];

    for (const ud of usersToCreate) {
      let user = await userRepo.findOneBy({ email: ud.email, tenantId: defaultTenant.id });
      if (!user) {
        const hash = await bcrypt.hash('SecureP@ssw0rd!', 12);
        user = userRepo.create({
          email: ud.email,
          firstName: ud.firstName,
          lastName: ud.lastName,
          tenantId: defaultTenant.id,
          passwordHash: hash,
          status: UserStatus.ACTIVE,
        });
        await userRepo.save(user);
        console.log(`Created User: ${ud.email}`);

        // Assign role
        const role = rolesMap.get(ud.role);
        if (role) {
          const ur = userRoleRepo.create({ userId: user.id, roleId: role.id, tenantId: defaultTenant.id });
          await userRoleRepo.save(ur);
        }
      } else {
        console.log(`User already exists: ${ud.email}`);
      }
    }

    // 6. SYSTEM CONFIG / FEATURE FLAGS
    const settings = [
      { key: 'enable_ai', value: 'true' },
      { key: 'enable_voice', value: 'true' },
      { key: 'enable_whatsapp', value: 'true' },
      { key: 'enable_marketplace', value: 'true' },
    ];

    for (const setting of settings) {
      let platSet = await platformSettingRepo.findOneBy({ key: setting.key });
      if (!platSet) {
        platSet = platformSettingRepo.create({ key: setting.key, value: setting.value, isPublic: true });
        await platformSettingRepo.save(platSet);
      }
    }
    console.log('System settings verified.');

    console.log('Seed completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Error during seed:', err);
    process.exit(1);
  }
}

seed();
