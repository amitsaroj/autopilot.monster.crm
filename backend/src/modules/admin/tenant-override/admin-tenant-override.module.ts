import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminTenantOverrideController } from './admin-tenant-override.controller';
import { AdminTenantOverrideService } from './admin-tenant-override.service';
import { Tenant } from '../../../database/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [AdminTenantOverrideController],
  providers: [AdminTenantOverrideService],
  exports: [AdminTenantOverrideService],
})
export class AdminTenantOverrideModule {}
