import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateBrandingDto, VerifyDomainDto } from './dto/tenant.dto';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { Roles, CurrentUser, ResourcePermissions } from '../../common/decorators';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('Tenant')
@ResourcePermissions('tenant')
@Controller()
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

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
}
