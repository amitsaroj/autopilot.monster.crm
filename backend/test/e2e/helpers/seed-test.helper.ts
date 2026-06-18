import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';

import { Tenant } from '../../../src/database/entities/tenant.entity';
import { UserEntity, UserStatus } from '../../../src/modules/auth/entities/user.entity';

export interface TestCredentials {
  tenantId: string;
  email: string;
  password: string;
}

export async function seedTestCredentials(): Promise<TestCredentials> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'autopilot_monster',
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'password',
    entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();

  const tenantRepo = dataSource.getRepository(Tenant);
  const userRepo = dataSource.getRepository(UserEntity);

  let tenant = await tenantRepo.findOne({ where: { slug: 'e2e-test' } });
  if (!tenant) {
    tenant = await tenantRepo.save(
      tenantRepo.create({ name: 'E2E Test Tenant', slug: 'e2e-test', status: 'ACTIVE' }),
    );
  }

  const email = 'e2e-user@autopilotmonster.com';
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

  await dataSource.destroy();

  return { tenantId: tenant.id, email, password };
}
