import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminUsersController } from './sub-admin-users.controller';
import { SubAdminUsersService } from './sub-admin-users.service';
import { UserEntity } from '@autopilot/core/modules/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [SubAdminUsersController],
  providers: [SubAdminUsersService],
  exports: [SubAdminUsersService],
})
export class SubAdminUsersModule {}
