import { Controller, Get, Post, Param, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';

@ApiTags('Plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('plugins')
export class PluginsController {
  @Get()
  @ApiOperation({ summary: 'Get installed plugins' })
  getPlugins() {
    return [];
  }

  @Post('enable/:id')
  @ApiOperation({ summary: 'Enable a plugin' })
  enablePlugin(@Param('id') id: string) {
    return { success: true, id };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disable/Remove a plugin' })
  removePlugin(@Param('id') id: string) {
    return { success: true, id };
  }
}
