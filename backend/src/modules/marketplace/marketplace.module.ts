import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceTemplateService } from './marketplace-template.service';
import { MarketplaceTemplateController } from './marketplace-template.controller';
import { Plugin } from '../../database/entities/plugin.entity';
import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';
import { MarketplaceTemplate } from '../../database/entities/marketplace-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin, TenantPlugin, MarketplaceTemplate])],
  controllers: [MarketplaceController, MarketplaceTemplateController],
  providers: [MarketplaceService, MarketplaceTemplateService],
  exports: [MarketplaceService, MarketplaceTemplateService],
})
export class MarketplaceModule {}
