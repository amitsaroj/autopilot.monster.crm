import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../database/base.repository';
import { Deal } from '../../database/entities/deal.entity';

@Injectable()
export class DealRepository extends BaseRepository<Deal> {
  constructor(
    @InjectRepository(Deal)
    dealRepo: Repository<Deal>
  ) {
    super(dealRepo);
  }
}
