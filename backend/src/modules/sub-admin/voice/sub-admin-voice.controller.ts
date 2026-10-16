import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminVoiceService } from './sub-admin-voice.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';
import { ProvisionVoiceNumberDto } from '../sub-admin.dto';

@ApiTags('SubAdmin / Voice')
@ApiBearerAuth()
@ResourcePermissions('voice')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/voice')
export class SubAdminVoiceController {
  constructor(private readonly voiceService: SubAdminVoiceService) {}

  @Get('numbers')
  @ApiOperation({ summary: 'Get active voice numbers for tenant' })
  async findNumbers(@TenantId() tenantId: string) {
    return await this.voiceService.findNumbers(tenantId);
  }

  @Post('numbers')
  @ApiOperation({ summary: 'Provision a new voice number' })
  async provisionNumber(@TenantId() tenantId: string, @Body() dto: ProvisionVoiceNumberDto) {
    return await this.voiceService.provisionNumber(tenantId, dto);
  }
}
