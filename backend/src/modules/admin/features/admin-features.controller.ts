import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminFeaturesService } from './admin-features.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/features')
export class AdminFeaturesController {
  constructor(private readonly adminFeaturesService: AdminFeaturesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plan features' })
  async findAll() {
    const data = await this.adminFeaturesService.findAll();
    return {
      status: 200,
      message: 'Features retrieved',
      error: false,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Add feature to a plan' })
  async create(@Body() body: any) {
    const data = await this.adminFeaturesService.create(body);
    return {
      status: 201,
      message: 'Feature added',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feature' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.adminFeaturesService.update(id, body);
    return {
      status: 200,
      message: 'Feature updated',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove feature from plan' })
  async remove(@Param('id') id: string) {
    await this.adminFeaturesService.remove(id);
    return {
      status: 200,
      message: 'Feature removed',
      error: false,
      data: null,
    };
  }
}
