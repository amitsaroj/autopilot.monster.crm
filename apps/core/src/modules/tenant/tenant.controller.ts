import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateBrandingDto, VerifyDomainDto, TenantFilterDto } from './dto/tenant.dto';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('Tenant')
@Controller()
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // --- Settings / Workspace ---

  @Get('settings/workspace')
  @ApiOperation({ summary: 'Get current workspace settings' })
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getMe(@CurrentUser() user: IRequestContext) {
    return this.tenantService.findOne(user.tenantId);
  }

  @Patch('settings/workspace')
  @ApiOperation({ summary: 'Update current workspace settings' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  async updateMe(@CurrentUser() user: IRequestContext, @Body() dto: Partial<CreateTenantDto>) {
    return this.tenantService.update(user.tenantId, dto);
  }

  @Post('settings/workspace/verify-domain')
  @ApiOperation({ summary: 'Verify custom domain' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  async verifyDomain(@CurrentUser() user: IRequestContext, @Body() dto: VerifyDomainDto) {
    return this.tenantService.verifyDomain(user.tenantId, dto.domain);
  }

  @Post('settings/workspace/branding')
  @ApiOperation({ summary: 'Update workspace branding' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  async setupBranding(@CurrentUser() user: IRequestContext, @Body() dto: UpdateBrandingDto) {
    return this.tenantService.updateBranding(user.tenantId, dto);
  }

  // --- Admin / Tenants ---

  @Get('admin/tenants')
  @ApiOperation({ summary: 'Get all tenants' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(@Query() filter: TenantFilterDto) {
    return this.tenantService.findAll(filter);
  }

  @Post('admin/tenants')
  @ApiOperation({ summary: 'Create a new tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get('admin/tenants/:id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch('admin/tenants/:id')
  @ApiOperation({ summary: 'Update tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() updateTenantDto: Partial<CreateTenantDto>) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Post('admin/tenants/:id/suspend')
  @ApiOperation({ summary: 'Suspend tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async suspend(@Param('id') id: string) {
    return this.tenantService.suspend(id);
  }

  @Post('admin/tenants/:id/activate')
  @ApiOperation({ summary: 'Activate tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activate(@Param('id') id: string) {
    return this.tenantService.activate(id);
  }

  @Delete('admin/tenants/:id')
  @ApiOperation({ summary: 'Soft delete tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }

  @Get('admin/tenants/:id/overrides')
  @ApiOperation({ summary: 'Get tenant overrides' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOverrides(@Param('id') id: string) {
    return this.tenantService.getOverrides(id);
  }

  @Post('admin/tenants/:id/overrides')
  @ApiOperation({ summary: 'Update tenant overrides' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateOverrides(@Param('id') id: string, @Body() overrides: any) {
    return this.tenantService.updateOverrides(id, overrides);
  }

  @Delete('admin/tenants/:id/overrides')
  @ApiOperation({ summary: 'Remove tenant overrides' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeOverrides(@Param('id') id: string) {
    return this.tenantService.removeOverrides(id);
  }
}

