import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserEntity } from '@autopilot/core/modules/auth/entities/user.entity';
import { Invitation } from '../../database/entities/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Invitation])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
