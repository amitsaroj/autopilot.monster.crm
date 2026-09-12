import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { SocialPost } from '../../database/entities/social-post.entity';
import { TenantId, Roles, ResourcePermissions } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Social Media')
@ResourcePermissions('social')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a new social media post' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async schedulePost(@TenantId() tenantId: string, @Body() body: Partial<SocialPost>) {
    return await this.socialService.schedulePost(tenantId, body);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get all scheduled posts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getPosts(@TenantId() tenantId: string) {
    return await this.socialService.getScheduledPosts(tenantId);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete a scheduled post' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async deletePost(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.socialService.deletePost(tenantId, id);
    return null;
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get social media analytics' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getAnalytics(@TenantId() tenantId: string) {
    return await this.socialService.getAnalytics(tenantId);
  }
}
