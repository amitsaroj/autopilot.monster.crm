import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserOverrideController } from './admin-user-override.controller';
import { AdminUserOverrideService } from './admin-user-override.service';
import { UserEntity } from '@autopilot/core/modules/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AdminUserOverrideController],
  providers: [AdminUserOverrideService],
  exports: [AdminUserOverrideService],
})
export class AdminUserOverrideModule {}
