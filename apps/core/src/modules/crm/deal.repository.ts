import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../../database/entities/deal.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class DealRepository extends BaseRepository<Deal> {
  constructor(
    @InjectRepository(Deal)
    dealRepository: Repository<Deal>,
  ) {
    super(dealRepository);
  }
}
