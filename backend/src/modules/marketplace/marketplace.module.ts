import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { Plugin } from '../../database/entities/plugin.entity';
import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin, TenantPlugin])],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
