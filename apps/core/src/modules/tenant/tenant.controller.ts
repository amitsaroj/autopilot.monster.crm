import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateBrandingDto, VerifyDomainDto } from './dto/tenant.dto';
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
    const data = await this.tenantService.findOne(user.tenantId);
    return {
      status: 200,
      message: 'Workspace settings retrieved',
      error: false,
      data,
    };
  }

  @Patch('settings/workspace')
  @ApiOperation({ summary: 'Update current workspace settings' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  async updateMe(@CurrentUser() user: IRequestContext, @Body() dto: Partial<CreateTenantDto>) {
    const data = await this.tenantService.update(user.tenantId, dto);
    return {
      status: 200,
      message: 'Workspace settings updated',
      error: false,
      data,
    };
  }

  @Post('settings/workspace/verify-domain')
  @ApiOperation({ summary: 'Verify custom domain' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  async verifyDomain(@CurrentUser() user: IRequestContext, @Body() dto: VerifyDomainDto) {
    const data = await this.tenantService.verifyDomain(user.tenantId, dto.domain);
    return {
      status: 200,
      message: 'Domain verification triggered',
      error: false,
      data,
    };
  }

  @Post('settings/workspace/branding')
  @ApiOperation({ summary: 'Update workspace branding' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  async setupBranding(@CurrentUser() user: IRequestContext, @Body() dto: UpdateBrandingDto) {
    const data = await this.tenantService.updateBranding(user.tenantId, dto);
    return {
      status: 200,
      message: 'Branding updated',
      error: false,
      data,
    };
  }

  // --- Admin / Tenants ---

  @Get('admin/tenants')
  @ApiOperation({ summary: 'Get all tenants' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    const data = await this.tenantService.findAll();
    return {
      status: 200,
      message: 'All tenants retrieved',
      error: false,
      data,
    };
  }

  @Post('admin/tenants')
  @ApiOperation({ summary: 'Create a new tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createTenantDto: CreateTenantDto) {
    const data = await this.tenantService.create(createTenantDto);
    return {
      status: 201,
      message: 'Tenant created',
      error: false,
      data,
    };
  }

  @Get('admin/tenants/:id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string) {
    const data = await this.tenantService.findOne(id);
    return {
      status: 200,
      message: 'Tenant retrieved',
      error: false,
      data,
    };
  }

  @Patch('admin/tenants/:id')
  @ApiOperation({ summary: 'Update tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() updateTenantDto: Partial<CreateTenantDto>) {
    const data = await this.tenantService.update(id, updateTenantDto);
    return {
      status: 200,
      message: 'Tenant updated',
      error: false,
      data,
    };
  }

  @Post('admin/tenants/:id/suspend')
  @ApiOperation({ summary: 'Suspend tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async suspend(@Param('id') id: string) {
    const data = await this.tenantService.suspend(id);
    return {
      status: 200,
      message: 'Tenant suspended',
      error: false,
      data,
    };
  }

  @Post('admin/tenants/:id/activate')
  @ApiOperation({ summary: 'Activate tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activate(@Param('id') id: string) {
    const data = await this.tenantService.activate(id);
    return {
      status: 200,
      message: 'Tenant activated',
      error: false,
      data,
    };
  }

  @Delete('admin/tenants/:id')
  @ApiOperation({ summary: 'Soft delete tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    await this.tenantService.remove(id);
    return {
      status: 200,
      message: 'Tenant deleted',
      error: false,
      data: null,
    };
  }

  @Get('admin/tenants/:id/overrides')
  @ApiOperation({ summary: 'Get tenant overrides' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOverrides(@Param('id') id: string) {
    const data = await this.tenantService.getOverrides(id);
    return {
      status: 200,
      message: 'Tenant overrides retrieved',
      error: false,
      data,
    };
  }

  @Post('admin/tenants/:id/overrides')
  @ApiOperation({ summary: 'Update tenant overrides' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateOverrides(@Param('id') id: string, @Body() overrides: any) {
    const data = await this.tenantService.updateOverrides(id, overrides);
    return {
      status: 200,
      message: 'Tenant overrides updated',
      error: false,
      data,
    };
  }

  @Delete('admin/tenants/:id/overrides')
  @ApiOperation({ summary: 'Remove tenant overrides' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeOverrides(@Param('id') id: string) {
    await this.tenantService.removeOverrides(id);
    return {
      status: 200,
      message: 'Tenant overrides removed',
      error: false,
      data: null,
    };
  }
}
