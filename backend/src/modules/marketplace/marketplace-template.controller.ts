import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceTemplateService } from './marketplace-template.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('marketplace/templates')
export class MarketplaceTemplateController {
  constructor(private readonly templateService: MarketplaceTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a marketplace template' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.templateService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Browse marketplace templates' })
  async findAll(@Query('category') category?: string, @Query('type') type?: string) {
    return this.templateService.findAll(category, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template details' })
  async findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Post(':id/install')
  @ApiOperation({ summary: 'Install a template' })
  async install(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templateService.install(tenantId, id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a template to marketplace' })
  async publish(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templateService.publish(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.templateService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a template' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templateService.remove(tenantId, id);
  }
}
