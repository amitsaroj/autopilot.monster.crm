import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRateLimitController } from './admin-rate-limit.controller';
import { AdminRateLimitService } from './admin-rate-limit.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminRateLimitController],
  providers: [AdminRateLimitService],
  exports: [AdminRateLimitService],
})
export class AdminRateLimitModule {}
