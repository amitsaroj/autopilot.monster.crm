import { Injectable } from '@nestjs/common';
import { SocialRepository } from './social.repository';
import { SocialPost, SocialPostStatus } from '../../database/entities/social-post.entity';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class SocialService {
  constructor(private readonly repository: SocialRepository) {}

  async schedulePost(tenantId: string, data: Partial<SocialPost>): Promise<SocialPost> {
    return this.repository.create(tenantId, {
      ...data,
      status: SocialPostStatus.SCHEDULED,
    });
  }

  async getScheduledPosts(tenantId: string): Promise<SocialPost[]> {
    return this.repository.findAll(tenantId);
  }

  async updatePost(tenantId: string, id: string, data: Partial<SocialPost>): Promise<SocialPost> {
    return this.repository.updateWithTenant(tenantId, id, data);
  }

  async deletePost(tenantId: string, id: string): Promise<void> {
    await this.repository.delete(tenantId, id);
  }

  async getPendingPosts(): Promise<SocialPost[]> {
    return this.repository.findGlobal({
      where: {
        status: SocialPostStatus.SCHEDULED,
        scheduledAt: LessThanOrEqual(new Date()),
      },
    });
  }

  async getAnalytics(tenantId: string) {
    const posts = await this.repository.findAll(tenantId);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    const totalShares = posts.reduce((sum, p) => sum + (p.sharesCount || 0), 0);
    const totalClicks = posts.reduce((sum, p) => sum + (p.clicksCount || 0), 0);
    
    // Engagement trend simulation
    const engagementTrend = posts.map(p => ({
      date: p.scheduledAt,
      likes: p.likesCount,
      shares: p.sharesCount,
      clicks: p.clicksCount,
    }));

    return {
      overview: { totalLikes, totalShares, totalClicks, totalPosts: posts.length },
      engagementTrend,
      platformDistribution: {
        FACEBOOK: posts.filter(p => p.platform === 'FACEBOOK').length,
        TWITTER: posts.filter(p => p.platform === 'TWITTER').length,
        LINKEDIN: posts.filter(p => p.platform === 'LINKEDIN').length,
      }
    };
  }
}
