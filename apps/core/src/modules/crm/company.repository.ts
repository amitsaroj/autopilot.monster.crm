import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../database/base.repository';
import { Company } from '../../database/entities/company.entity';

@Injectable()
export class CompanyRepository extends BaseRepository<Company> {
  constructor(
    @InjectRepository(Company)
    companyRepo: Repository<Company>
  ) {
    super(companyRepo);
  }
}
