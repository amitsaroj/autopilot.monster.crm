import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flow } from '../../database/entities/flow.entity';

@Injectable()
export class FlowService {
  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,
  ) {}

  async findAll(tenantId: string) {
    return this.flowRepo.find({ where: { tenantId } });
  }

  async findOne(tenantId: string, id: string) {
    const flow = await this.flowRepo.findOne({ where: { id, tenantId } });
    if (!flow) throw new NotFoundException('Flow not found');
    return flow;
  }

  async create(tenantId: string, data: Partial<Flow>) {
    const flow = this.flowRepo.create({ ...data, tenantId });
    return this.flowRepo.save(flow);
  }

  async update(tenantId: string, id: string, data: Partial<Flow>) {
    await this.findOne(tenantId, id);
    await this.flowRepo.update({ id, tenantId }, data);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    const flow = await this.findOne(tenantId, id);
    return this.flowRepo.remove(flow);
  }
}
