import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminIpWhitelistController } from './admin-ip-whitelist.controller';
import { AdminIpWhitelistService } from './admin-ip-whitelist.service';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [AdminIpWhitelistController],
  providers: [AdminIpWhitelistService],
  exports: [AdminIpWhitelistService],
})
export class AdminIpWhitelistModule {}
