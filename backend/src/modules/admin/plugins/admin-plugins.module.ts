import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPluginsController } from './admin-plugins.controller';
import { AdminPluginsService } from './admin-plugins.service';
import { Plugin } from '../../../database/entities/plugin.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin, TenantPlugin])],
  controllers: [AdminPluginsController],
  providers: [AdminPluginsService],
  exports: [AdminPluginsService],
})
export class AdminPluginsModule {}
