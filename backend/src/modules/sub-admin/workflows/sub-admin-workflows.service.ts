import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flow } from '../../../database/entities/flow.entity';

@Injectable()
export class SubAdminWorkflowsService {
  constructor(
    @InjectRepository(Flow) private readonly workflowRepo: Repository<Flow>,
  ) {}

  async findAll(tenantId: string) {
    return this.workflowRepo.find({ where: { tenantId } });
  }

  async create(tenantId: string, dto: any) {
    const workflow = this.workflowRepo.create({ ...dto, tenantId });
    return this.workflowRepo.save(workflow);
  }

  async remove(tenantId: string, id: string) {
    const workflow = await this.workflowRepo.findOne({ where: { id, tenantId } });
    if (!workflow) throw new NotFoundException('Workflow vector not found');
    return this.workflowRepo.delete(id);
  }
}
