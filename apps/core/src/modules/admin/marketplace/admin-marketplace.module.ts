import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMarketplaceController } from './admin-marketplace.controller';
import { AdminMarketplaceService } from './admin-marketplace.service';
import { Plugin } from '../../../database/entities/plugin.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plugin, TenantPlugin]),
  ],
  controllers: [AdminMarketplaceController],
  providers: [AdminMarketplaceService],
  exports: [AdminMarketplaceService],
})
export class AdminMarketplaceModule {}
