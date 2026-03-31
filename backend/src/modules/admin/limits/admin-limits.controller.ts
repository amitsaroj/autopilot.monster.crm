import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminLimitsService } from './admin-limits.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Limits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/limits')
export class AdminLimitsController {
  constructor(private readonly adminLimitsService: AdminLimitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plan limits' })
  async findAll() {
    const data = await this.adminLimitsService.findAll();
    return {
      status: 200,
      message: 'Limits retrieved',
      error: false,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Add limit to a plan' })
  async create(@Body() body: any) {
    const data = await this.adminLimitsService.create(body);
    return {
      status: 201,
      message: 'Limit added',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update limit' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.adminLimitsService.update(id, body);
    return {
      status: 200,
      message: 'Limit updated',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove limit from plan' })
  async remove(@Param('id') id: string) {
    await this.adminLimitsService.remove(id);
    return {
      status: 200,
      message: 'Limit removed',
      error: false,
      data: null,
    };
  }
}
