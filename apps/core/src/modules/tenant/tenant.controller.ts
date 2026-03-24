import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateBrandingDto, VerifyDomainDto } from './dto/tenant.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('Tenant')
@Controller('tenants')
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current tenant context' })
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: IRequestContext) {
    return this.tenantService.findOne(user.tenantId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current tenant settings' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateMe(@CurrentUser() user: IRequestContext, @Body() dto: Partial<CreateTenantDto>) {
    return this.tenantService.update(user.tenantId, dto);
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get tenant limits' })
  @UseGuards(JwtAuthGuard)
  getLimits(@CurrentUser() user: IRequestContext) {
    return this.tenantService.getLimits(user.tenantId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get tenant usage' })
  @UseGuards(JwtAuthGuard)
  getUsage(@CurrentUser() user: IRequestContext) {
    return this.tenantService.getUsage(user.tenantId);
  }

  @Post('verify-domain')
  @ApiOperation({ summary: 'Verify custom domain' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  verifyDomain(@CurrentUser() user: IRequestContext, @Body() dto: VerifyDomainDto) {
    return this.tenantService.verifyDomain(user.tenantId, dto.domain);
  }

  @Post('setup-branding')
  @ApiOperation({ summary: 'Setup tenant branding' })
  @Roles('TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  setupBranding(@CurrentUser() user: IRequestContext, @Body() dto: UpdateBrandingDto) {
    return this.tenantService.updateBranding(user.tenantId, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateTenantDto: Partial<CreateTenantDto>) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete tenant' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
