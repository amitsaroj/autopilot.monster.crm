import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminUsersController } from './sub-admin-users.controller';
import { SubAdminUsersService } from './sub-admin-users.service';
import { UserEntity } from '@autopilot/core/modules/auth/entities/user.entity';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UsersModule],
  controllers: [SubAdminUsersController],
  providers: [SubAdminUsersService],
  exports: [SubAdminUsersService],
})
export class SubAdminUsersModule {}
