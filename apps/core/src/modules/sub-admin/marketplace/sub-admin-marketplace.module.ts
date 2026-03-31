import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminMarketplaceController } from './sub-admin-marketplace.controller';
import { SubAdminMarketplaceService } from './sub-admin-marketplace.service';
import { Plugin } from '../../../database/entities/plugin.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin, TenantPlugin])],
  controllers: [SubAdminMarketplaceController],
  providers: [SubAdminMarketplaceService],
  exports: [SubAdminMarketplaceService],
})
export class SubAdminMarketplaceModule {}
