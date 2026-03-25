import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminTenantsController } from './admin-tenants.controller';
import { AdminTenantsService } from './admin-tenants.service';
import { Tenant } from '@autopilot/core/database/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [AdminTenantsController],
  providers: [AdminTenantsService],
  exports: [AdminTenantsService],
})
export class AdminTenantsModule {}
