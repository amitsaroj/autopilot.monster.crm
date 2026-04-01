import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { SocialPost } from '../../database/entities/social-post.entity';
import { TenantId, Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Social Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a new social media post' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async schedulePost(@TenantId() tenantId: string, @Body() body: Partial<SocialPost>) {
    const post = await this.socialService.schedulePost(tenantId, body);
    return {
      status: 201,
      message: 'Post scheduled successfully',
      error: false,
      data: post,
    };
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get all scheduled posts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getPosts(@TenantId() tenantId: string) {
    const posts = await this.socialService.getScheduledPosts(tenantId);
    return {
      status: 200,
      message: 'Scheduled posts retrieved',
      error: false,
      data: posts,
    };
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete a scheduled post' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async deletePost(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.socialService.deletePost(tenantId, id);
    return {
      status: 200,
      message: 'Post deleted successfully',
      error: false,
      data: null,
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get social media analytics' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getAnalytics(@TenantId() tenantId: string) {
    const analytics = await this.socialService.getAnalytics(tenantId);
    return {
      status: 200,
      message: 'Analytics retrieved',
      error: false,
      data: analytics,
    };
  }
}
