import {
  Controller, Get, Post, Body, Param, Delete, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/tenant-features.dto';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TENANT_ADMIN')
@Controller('settings/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new API key' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys' })
  async findAll(@TenantId() tenantId: string) {
    return this.apiKeyService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key details' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.apiKeyService.findOne(tenantId, id);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke an API key' })
  async revoke(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.apiKeyService.revoke(tenantId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an API key' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.apiKeyService.remove(tenantId, id);
  }
}
