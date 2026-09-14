import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminMarketplaceService } from './admin-marketplace.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';
import { CreatePluginDto, UpdatePluginDto } from './admin-marketplace.dto';

@ApiTags('Admin / Marketplace & Plugins')
@ResourcePermissions('marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/marketplace')
export class AdminMarketplaceController {
  constructor(private readonly marketplaceService: AdminMarketplaceService) {}

  @Get('plugins')
  @ApiOperation({ summary: 'List all global plugins' })
  async findAll() {
    return await this.marketplaceService.findAll();
  }

  @Post('plugins')
  @ApiOperation({ summary: 'Create a new global plugin' })
  async create(@Body() dto: CreatePluginDto) {
    return await this.marketplaceService.create(dto);
  }

  @Put('plugins/:id')
  @ApiOperation({ summary: 'Update a global plugin' })
  async update(@Param('id') id: string, @Body() dto: UpdatePluginDto) {
    return await this.marketplaceService.update(id, dto);
  }

  @Delete('plugins/:id')
  @ApiOperation({ summary: 'Delete a global plugin' })
  async delete(@Param('id') id: string) {
    await this.marketplaceService.delete(id);
    return null;
  }

  @Get('plugins/:id/installations')
  @ApiOperation({ summary: 'Get plugin installations across tenants' })
  async getInstallations(@Param('id') id: string) {
    return await this.marketplaceService.getInstallations(id);
  }

  @Get('monetization')
  @ApiOperation({ summary: 'Get marketplace monetization stats' })
  async getMonetization() {
    return await this.marketplaceService.getMonetizationStats();
  }
}
