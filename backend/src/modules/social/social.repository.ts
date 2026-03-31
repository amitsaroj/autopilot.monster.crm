import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { BaseRepository } from '../../database/base.repository';
import { SocialPost } from '../../database/entities/social-post.entity';

@Injectable()
export class SocialRepository extends BaseRepository<SocialPost> {
  constructor(
    @InjectRepository(SocialPost)
    private readonly socialPostRepository: Repository<SocialPost>,
  ) {
    super(socialPostRepository);
  }

  async findGlobal(options: FindManyOptions<SocialPost>): Promise<SocialPost[]> {
    return this.socialPostRepository.find(options);
  }
}
