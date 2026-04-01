import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminMarketplaceService } from './admin-marketplace.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';
import { CreatePluginDto, UpdatePluginDto } from './admin-marketplace.dto';

@ApiTags('Admin / Marketplace & Plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/marketplace')
export class AdminMarketplaceController {
  constructor(private readonly marketplaceService: AdminMarketplaceService) {}

  @Get('plugins')
  @ApiOperation({ summary: 'List all global plugins' })
  async findAll() {
    const data = await this.marketplaceService.findAll();
    return { status: 200, message: 'Plugins retrieved', error: false, data };
  }

  @Post('plugins')
  @ApiOperation({ summary: 'Create a new global plugin' })
  async create(@Body() dto: CreatePluginDto) {
    const data = await this.marketplaceService.create(dto);
    return { status: 201, message: 'Plugin created', error: false, data };
  }

  @Put('plugins/:id')
  @ApiOperation({ summary: 'Update a global plugin' })
  async update(@Param('id') id: string, @Body() dto: UpdatePluginDto) {
    const data = await this.marketplaceService.update(id, dto);
    return { status: 200, message: 'Plugin updated', error: false, data };
  }

  @Delete('plugins/:id')
  @ApiOperation({ summary: 'Delete a global plugin' })
  async delete(@Param('id') id: string) {
    await this.marketplaceService.delete(id);
    return { status: 200, message: 'Plugin deleted', error: false, data: null };
  }

  @Get('plugins/:id/installations')
  @ApiOperation({ summary: 'Get plugin installations across tenants' })
  async getInstallations(@Param('id') id: string) {
    const data = await this.marketplaceService.getInstallations(id);
    return { status: 200, message: 'Installations retrieved', error: false, data };
  }
}
