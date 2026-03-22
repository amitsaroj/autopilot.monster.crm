import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../../database/entities/agent.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,
  ) {}

  async findAll(tenantId: string) {
    return this.agentRepo.find({ where: { tenantId } });
  }

  async findOne(tenantId: string, id: string) {
    const agent = await this.agentRepo.findOne({ where: { id, tenantId } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async create(tenantId: string, data: Partial<Agent>) {
    const agent = this.agentRepo.create({ ...data, tenantId });
    return this.agentRepo.save(agent);
  }

  async update(tenantId: string, id: string, data: Partial<Agent>) {
    await this.findOne(tenantId, id);
    await this.agentRepo.update({ id, tenantId }, data);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    const agent = await this.findOne(tenantId, id);
    return this.agentRepo.remove(agent);
  }
}
