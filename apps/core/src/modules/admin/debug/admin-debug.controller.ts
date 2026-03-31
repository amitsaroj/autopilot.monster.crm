import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDebugService } from './admin-debug.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Debug Tools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/debug')
export class AdminDebugController {
  constructor(private readonly debugService: AdminDebugService) {}

  @Post('cache/clear')
  @ApiOperation({ summary: 'Clear all system caches (Redis)' })
  async clearCache() {
    await this.debugService.clearCache();
    return { status: 200, message: 'Redundant memory buffers purged', error: false };
  }

  @Post('events/simulate-error')
  @ApiOperation({ summary: 'Simulate a core system error for testing' })
  async simulateError() {
    await this.debugService.simulateError();
    return { status: 200, message: 'Exception trajectory initiated', error: false };
  }

  @Get('environment/safe')
  @ApiOperation({ summary: 'Get sanitized environment variables' })
  async getEnv() {
    const data = await this.debugService.getSanitizedEnv();
    return { status: 200, message: 'Environment blueprint retrieved', error: false, data };
  }
}
