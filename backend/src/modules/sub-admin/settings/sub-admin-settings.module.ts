import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminSettingsController } from './sub-admin-settings.controller';
import { SubAdminSettingsService } from './sub-admin-settings.service';
import { Tenant } from '../../../database/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [SubAdminSettingsController],
  providers: [SubAdminSettingsService],
  exports: [SubAdminSettingsService],
})
export class SubAdminSettingsModule {}
