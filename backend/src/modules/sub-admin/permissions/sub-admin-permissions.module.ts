import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminPermissionsController } from './sub-admin-permissions.controller';
import { SubAdminPermissionsService } from './sub-admin-permissions.service';
import { Permission } from '../../../database/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [SubAdminPermissionsController],
  providers: [SubAdminPermissionsService],
  exports: [SubAdminPermissionsService],
})
export class SubAdminPermissionsModule {}
