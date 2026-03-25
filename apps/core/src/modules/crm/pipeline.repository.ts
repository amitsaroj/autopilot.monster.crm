import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../database/base.repository';
import { Pipeline } from '../../database/entities/pipeline.entity';

@Injectable()
export class PipelineRepository extends BaseRepository<Pipeline> {
  constructor(
    @InjectRepository(Pipeline)
    pipelineRepo: Repository<Pipeline>
  ) {
    super(pipelineRepo);
  }
}
