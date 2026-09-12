import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResourcePermissions } from '../../common/decorators';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Support & Ticketing')
@ResourcePermissions('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Get all tickets for workspace' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getTickets(@TenantId() tenantId: string) {
    return await this.supportService.findAll(tenantId);
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async createTicket(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.supportService.create(tenantId, dto);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket details' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getTicket(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.supportService.findOne(tenantId, id);
  }

  @Put('tickets/:id')
  @ApiOperation({ summary: 'Update ticket' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async updateTicket(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return await this.supportService.update(tenantId, id, dto);
  }

  @Delete('tickets/:id')
  @ApiOperation({ summary: 'Delete ticket' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteTicket(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.supportService.remove(tenantId, id);
    return null;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket stats' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getStats(@TenantId() tenantId: string) {
    return await this.supportService.getStats(tenantId);
  }

  // --- Knowledge Base (Articles) ---
  @Get('articles')
  @ApiOperation({ summary: 'Get all articles' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getArticles(@TenantId() tenantId: string) {
    return await this.supportService.findAllArticles(tenantId);
  }

  @Post('articles')
  @ApiOperation({ summary: 'Create knowledge article' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createArticle(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.supportService.createArticle(tenantId, dto);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article details' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getArticle(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.supportService.findOneArticle(tenantId, id);
  }

  @Put('articles/:id')
  @ApiOperation({ summary: 'Update article' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateArticle(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return await this.supportService.updateArticle(tenantId, id, dto);
  }

  @Delete('articles/:id')
  @ApiOperation({ summary: 'Delete article' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteArticle(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.supportService.removeArticle(tenantId, id);
    return null;
  }
}
