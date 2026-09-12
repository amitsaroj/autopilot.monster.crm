import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminLimitsService } from './admin-limits.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Limits')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/limits')
export class AdminLimitsController {
  constructor(private readonly adminLimitsService: AdminLimitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plan limits' })
  async findAll() {
    return await this.adminLimitsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Add limit to a plan' })
  async create(@Body() body: any) {
    return await this.adminLimitsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update limit' })
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.adminLimitsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove limit from plan' })
  async remove(@Param('id') id: string) {
    await this.adminLimitsService.remove(id);
    return null;
  }
}
