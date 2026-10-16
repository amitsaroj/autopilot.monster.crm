import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flow } from '../../../database/entities/flow.entity';
import { CreateSubAdminWorkflowDto } from '../sub-admin.dto';

@Injectable()
export class SubAdminWorkflowsService {
  constructor(@InjectRepository(Flow) private readonly workflowRepo: Repository<Flow>) {}

  async findAll(tenantId: string) {
    return this.workflowRepo.find({ where: { tenantId } });
  }

  async create(tenantId: string, dto: CreateSubAdminWorkflowDto) {
    const workflow = this.workflowRepo.create({
      tenantId,
      name: dto.name,
      description: dto.description,
      type: dto.type ?? 'voice',
      definition: dto.definition ?? {},
    });
    return this.workflowRepo.save(workflow);
  }

  async remove(tenantId: string, id: string) {
    const workflow = await this.workflowRepo.findOne({ where: { id, tenantId } });
    if (!workflow) throw new NotFoundException('Workflow vector not found');
    return this.workflowRepo.delete({ id, tenantId });
  }
}
