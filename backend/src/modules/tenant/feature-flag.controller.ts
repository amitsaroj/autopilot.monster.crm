import {
  Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureFlagService } from './feature-flag.service';
import { CreateFeatureFlagDto } from './dto/tenant-features.dto';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('Feature Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TENANT_ADMIN')
@Controller('settings/feature-flags')
export class FeatureFlagController {
  constructor(private readonly flagService: FeatureFlagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a feature flag' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateFeatureFlagDto) {
    return this.flagService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all feature flags' })
  async findAll(@TenantId() tenantId: string) {
    return this.flagService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature flag details' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.flagService.findOne(tenantId, id);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Toggle feature flag on/off' })
  async toggle(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.flagService.toggle(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feature flag' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateFeatureFlagDto>,
  ) {
    return this.flagService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feature flag' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.flagService.remove(tenantId, id);
  }
}
