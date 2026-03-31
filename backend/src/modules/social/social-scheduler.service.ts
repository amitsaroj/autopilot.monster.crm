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
        this.logger.log(`Fulfilling post ${post.id} for platform ${post.platform}`);
        
        // MOCK EXTERNAL API CALL
        await new Promise(resolve => setTimeout(resolve, 500)); 

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
}
