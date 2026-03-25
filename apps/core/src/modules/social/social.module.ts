import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialPost } from '../../database/entities/social-post.entity';
import { SocialService } from './social.service';
import { SocialSchedulerService } from './social-scheduler.service';
import { SocialController } from './social.controller';
import { SocialRepository } from './social.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SocialPost])],
  providers: [SocialService, SocialSchedulerService, SocialRepository],
  controllers: [SocialController],
  exports: [SocialService],
})
export class SocialModule {}
