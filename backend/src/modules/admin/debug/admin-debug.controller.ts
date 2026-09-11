import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDebugService } from './admin-debug.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Debug Tools')
@ResourcePermissions('admin')
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
    return { message: 'Redundant memory buffers purged' };
  }

  @Post('events/simulate-error')
  @ApiOperation({ summary: 'Simulate a core system error for testing' })
  async simulateError() {
    await this.debugService.simulateError();
    return { message: 'Exception trajectory initiated' };
  }

  @Get('environment/safe')
  @ApiOperation({ summary: 'Get sanitized environment variables' })
  async getEnv() {
    return await this.debugService.getSanitizedEnv();
  }
}
