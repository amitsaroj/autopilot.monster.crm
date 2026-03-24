import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { RbacRepository } from './rbac.repository';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { UserRole } from '../../database/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, UserRole])],
  controllers: [RbacController],
  providers: [RbacService, RbacRepository],
  exports: [RbacService],
})
export class RbacModule {}
