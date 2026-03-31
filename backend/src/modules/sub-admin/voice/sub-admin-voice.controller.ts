import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminVoiceService } from './sub-admin-voice.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Voice')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/voice')
export class SubAdminVoiceController {
  constructor(private readonly voiceService: SubAdminVoiceService) {}

  @Get('numbers')
  @ApiOperation({ summary: 'Get active voice numbers for tenant' })
  async findNumbers(@TenantId() tenantId: string) {
    const data = await this.voiceService.findNumbers(tenantId);
    return { status: 200, message: 'Voice manifold synchronized', error: false, data };
  }

  @Post('numbers')
  @ApiOperation({ summary: 'Provision a new voice number' })
  async provisionNumber(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.voiceService.provisionNumber(tenantId, dto);
    return { status: 201, message: 'Voice vector established', error: false, data };
  }
}
