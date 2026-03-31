import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminIntegrationsController } from './sub-admin-integrations.controller';
import { SubAdminIntegrationsService } from './sub-admin-integrations.service';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantSetting])],
  controllers: [SubAdminIntegrationsController],
  providers: [SubAdminIntegrationsService],
  exports: [SubAdminIntegrationsService],
})
export class SubAdminIntegrationsModule {}
