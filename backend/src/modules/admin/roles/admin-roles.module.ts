import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRolesController } from './admin-roles.controller';
import { AdminRolesService } from './admin-roles.service';
import { Role } from '@autopilot/core/database/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [AdminRolesController],
  providers: [AdminRolesService],
  exports: [AdminRolesService],
})
export class AdminRolesModule {}
