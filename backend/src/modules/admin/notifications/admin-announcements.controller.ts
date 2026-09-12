import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAnnouncementsService } from './admin-announcements.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Announcements')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/announcements')
export class AdminAnnouncementsController {
  constructor(private readonly announcementsService: AdminAnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system announcements' })
  async findAll() {
    return await this.announcementsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new system announcement' })
  async create(@Body() data: { title: string; content: string; type?: string; expiresAt?: Date }) {
    return await this.announcementsService.create(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a system announcement' })
  async remove(@Param('id') id: string) {
    await this.announcementsService.remove(id);
    return null;
  }
}
