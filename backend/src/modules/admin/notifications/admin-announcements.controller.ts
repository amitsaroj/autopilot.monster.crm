import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAnnouncementsService } from './admin-announcements.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/announcements')
export class AdminAnnouncementsController {
  constructor(private readonly announcementsService: AdminAnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system announcements' })
  async findAll() {
    const data = await this.announcementsService.findAll();
    return { status: 200, message: 'Announcements retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new system announcement' })
  async create(@Body() data: { title: string; content: string; type?: string; expiresAt?: Date }) {
    const result = await this.announcementsService.create(data);
    return { status: 201, message: 'Announcement created', error: false, data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a system announcement' })
  async remove(@Param('id') id: string) {
    await this.announcementsService.remove(id);
    return { status: 200, message: 'Announcement removed', error: false, data: null };
  }
}
