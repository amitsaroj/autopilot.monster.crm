import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CoreModule } from '../../../src/app.module';
import { JwtAuthGuard } from '../../../src/common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../src/common/guards/tenant.guard';
import { RolesGuard } from '../../../src/common/guards/roles.guard';
import { PlanGuard } from '../../../src/common/guards/plan.guard';
import { PermissionGuard } from '../../../src/common/guards/permission.guard';
import { FeatureGuard } from '../../../src/common/guards/feature.guard';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [CoreModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(TenantGuard)
    .useValue({
      canActivate: (context: { switchToHttp: () => { getRequest: () => Record<string, unknown> } }) => {
        const req = context.switchToHttp().getRequest();
        if (!req.tenantId) {
          req.tenantId = (req.headers as Record<string, string>)['x-tenant-id'] ?? 'test-tenant';
        }
        return true;
      },
    })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(PlanGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(PermissionGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(FeatureGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

export async function isPostgresReachable(): Promise<boolean> {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: process.env.DB_NAME ?? 'autopilot_monster',
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? 'password',
      connectionTimeoutMillis: 2000,
    });
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}
