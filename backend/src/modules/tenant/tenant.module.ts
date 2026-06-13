import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantRepository } from './tenant.repository';
import { Tenant } from '../../database/entities/tenant.entity';
import { ApiKey } from '../../database/entities/api-key.entity';
import { FeatureFlag } from '../../database/entities/feature-flag.entity';
import { TeamGroup } from '../../database/entities/team-group.entity';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { FeatureFlagService } from './feature-flag.service';
import { FeatureFlagController } from './feature-flag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, ApiKey, FeatureFlag, TeamGroup])],
  controllers: [TenantController, ApiKeyController, TeamController, FeatureFlagController],
  providers: [TenantService, TenantRepository, ApiKeyService, TeamService, FeatureFlagService],
  exports: [TenantService, ApiKeyService, TeamService, FeatureFlagService],
})
export class TenantModule {}
