import { Module } from '@nestjs/common';
import { AdminTenantsController } from './admin-tenants.controller';
import { AdminTenantsService } from './admin-tenants.service';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [AdminTenantsController],
  providers: [AdminTenantsService],
  exports: [AdminTenantsService],
})
export class AdminTenantsModule {}
