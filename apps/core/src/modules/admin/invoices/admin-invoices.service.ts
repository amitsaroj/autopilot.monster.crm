import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '@autopilot/core/database/entities/invoice.entity';

@Injectable()
export class AdminInvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async findAll(options: { tenantId?: string; status?: string }) {
    const where: any = {};
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.status) where.status = options.status;

    return this.invoiceRepo.find({
      where,
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['tenant'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.invoiceRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);
    return this.invoiceRepo.remove(invoice);
  }
}
