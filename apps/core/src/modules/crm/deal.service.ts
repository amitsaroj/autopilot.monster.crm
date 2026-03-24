import { Injectable, NotFoundException } from '@nestjs/common';
import { DealRepository } from './deal.repository';
import { CreateDealDto } from './dto/crm.dto';
import { Deal } from '../../database/entities/deal.entity';

@Injectable()
export class DealService {
  constructor(private readonly dealRepository: DealRepository) {}

  async create(tenantId: string, dto: CreateDealDto): Promise<Deal> {
    return this.dealRepository.create(tenantId, dto);
  }

  async findAll(tenantId: string): Promise<Deal[]> {
    return this.dealRepository.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<Deal> {
    const deal = await this.dealRepository.findById(tenantId, id);
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async update(tenantId: string, id: string, dto: Partial<CreateDealDto>): Promise<Deal> {
    return this.dealRepository.update(tenantId, id, dto);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.dealRepository.delete(tenantId, id);
  }
}
