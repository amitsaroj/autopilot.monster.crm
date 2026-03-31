import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminPluginsController } from './sub-admin-plugins.controller';
import { SubAdminPluginsService } from './sub-admin-plugins.service';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';
import { Plugin } from '../../../database/entities/plugin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin, TenantPlugin])],
  controllers: [SubAdminPluginsController],
  providers: [SubAdminPluginsService],
  exports: [SubAdminPluginsService],
})
export class SubAdminPluginsModule {}
