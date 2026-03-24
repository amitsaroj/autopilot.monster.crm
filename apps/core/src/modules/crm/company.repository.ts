import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../database/entities/company.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class CompanyRepository extends BaseRepository<Company> {
  constructor(
    @InjectRepository(Company)
    companyRepository: Repository<Company>,
  ) {
    super(companyRepository);
  }
}
