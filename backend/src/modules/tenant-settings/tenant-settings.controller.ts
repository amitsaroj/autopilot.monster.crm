import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantSettingsService } from './tenant-settings.service';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('Tenant / Settings / Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles('TENANT_ADMIN')
@Controller('settings/integrations')
export class TenantSettingsController {
  constructor(private readonly service: TenantSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integration settings for the current workspace' })
  async findAll(@CurrentUser() user: IRequestContext) {
    const data = await this.service.findAll(user.tenantId);
    return { status: 200, message: 'Integration settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update or create an integration setting' })
  async update(
    @CurrentUser() user: IRequestContext,
    @Body() data: { key: string; value: any; group?: string },
  ) {
    const result = await this.service.updateSetting(user.tenantId, data);
    return { status: 200, message: 'Integration setting updated', error: false, data: result };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Remove a tenant-specific integration override' })
  async remove(@CurrentUser() user: IRequestContext, @Param('key') key: string) {
    await this.service.removeSetting(user.tenantId, key);
    return { status: 200, message: 'Integration override removed', error: false, data: null };
  }
}
