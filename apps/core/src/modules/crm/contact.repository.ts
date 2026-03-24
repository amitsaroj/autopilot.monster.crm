import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../database/entities/contact.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class ContactRepository extends BaseRepository<Contact> {
  constructor(
    @InjectRepository(Contact)
    contactRepository: Repository<Contact>,
  ) {
    super(contactRepository);
  }
}
