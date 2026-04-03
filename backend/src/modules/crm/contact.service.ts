import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { CreateContactDto } from './dto/crm.dto';
import { Contact } from '../../database/entities/contact.entity';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async create(tenantId: string, dto: CreateContactDto): Promise<Contact> {
    return this.contactRepository.create(tenantId, dto);
  }

  async findAll(tenantId: string): Promise<Contact[]> {
    return this.contactRepository.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<Contact> {
    const contact = await this.contactRepository.findById(tenantId, id);
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(tenantId: string, id: string, dto: Partial<CreateContactDto>): Promise<Contact> {
    return this.contactRepository.updateWithTenant(tenantId, id, dto);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.contactRepository.delete(tenantId, id);
  }
}
