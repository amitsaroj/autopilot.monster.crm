import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SocialService } from './social.service';
import { SocialPostStatus } from '../../database/entities/social-post.entity';

@Injectable()
export class SocialSchedulerService {
  private readonly logger = new Logger(SocialSchedulerService.name);

  constructor(private readonly socialService: SocialService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running social media scheduler sync...');
    const pendingPosts = await this.socialService.getPendingPosts();

    if (pendingPosts.length === 0) return;

    this.logger.log(`Found ${pendingPosts.length} pending posts to fulfill.`);

    for (const post of pendingPosts) {
      try {
        this.logger.log(`Publishing post ${post.id} to ${post.platform}`);
        
        // Dispatch to platform-specific publisher
        await this.publishToExternalPlatform(post);

        await this.socialService.updatePost(post.tenantId, post.id, {
          status: SocialPostStatus.POSTED,
        });
        
        this.logger.log(`Post ${post.id} successfully published.`);
      } catch (error: any) {
        this.logger.error(`Failed to fulfill post ${post.id}: ${error?.message || 'Unknown error'}`);
        await this.socialService.updatePost(post.tenantId, post.id, {
          status: SocialPostStatus.FAILED,
          failReason: error?.message || 'Unknown error',
        });
      }
    }
  }

  private async publishToExternalPlatform(post: any): Promise<void> {
    const platform = post.platform;
    this.logger.debug(`Dispatching to ${platform} API for post ${post.id}`);

    switch (platform) {
      case 'FACEBOOK':
      case 'INSTAGRAM': {
        const pageToken = process.env.FACEBOOK_PAGE_TOKEN;
        const pageId = process.env.FACEBOOK_PAGE_ID;
        if (!pageToken || !pageId) {
          this.logger.warn(`Facebook/Instagram credentials not configured — skipping publish for post ${post.id}`);
          return;
        }
        const res = await fetch(`https://graph.facebook.com/v17.0/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: post.content,
            access_token: pageToken,
          }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Facebook API error: ${err}`);
        }
        break;
      }

      case 'TWITTER': {
        const bearerToken = process.env.TWITTER_BEARER_TOKEN;
        if (!bearerToken) {
          this.logger.warn(`Twitter credentials not configured — skipping publish for post ${post.id}`);
          return;
        }
        const res = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: post.content }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Twitter API error: ${err}`);
        }
        break;
      }

      case 'LINKEDIN': {
        const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
        const authorUrn = process.env.LINKEDIN_AUTHOR_URN;
        if (!accessToken || !authorUrn) {
          this.logger.warn(`LinkedIn credentials not configured — skipping publish for post ${post.id}`);
          return;
        }
        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: post.content },
                shareMediaCategory: 'NONE',
              },
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
          }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`LinkedIn API error: ${err}`);
        }
        break;
      }

      default:
        this.logger.warn(`Unsupported platform: ${platform}`);
    }
  }
}
