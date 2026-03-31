import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminRolesController } from './sub-admin-roles.controller';
import { SubAdminRolesService } from './sub-admin-roles.service';
import { Role } from '../../../database/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [SubAdminRolesController],
  providers: [SubAdminRolesService],
  exports: [SubAdminRolesService],
})
export class SubAdminRolesModule {}
