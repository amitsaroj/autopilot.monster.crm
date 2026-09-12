import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminFeaturesService } from './admin-features.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Features')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/features')
export class AdminFeaturesController {
  constructor(private readonly adminFeaturesService: AdminFeaturesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plan features' })
  async findAll() {
    return await this.adminFeaturesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Add feature to a plan' })
  async create(@Body() body: any) {
    return await this.adminFeaturesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feature' })
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.adminFeaturesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove feature from plan' })
  async remove(@Param('id') id: string) {
    await this.adminFeaturesService.remove(id);
    return null;
  }
}
