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

  getTemplates() {
    return [
      {
        id: 'sales-closer',
        name: 'Real Estate Closer',
        description: 'Specialized in high-pressure sales and objection handling.',
        role: 'SALES',
        category: 'Real Estate',
        prompt: 'You are a professional real estate closer...',
        capabilities: ['Outbound Calling', 'Lead Qualifying', 'Appointment Setting'],
      },
      {
        id: 'saas-support',
        name: 'SaaS Tech Support',
        description: 'Empathetic and technical, focused on resolving customer issues.',
        role: 'SUPPORT',
        category: 'Technology',
        prompt: 'You are a technical support specialist for a SaaS platform...',
        capabilities: ['Troubleshooting', 'Ticket Management', 'Onboarding'],
      },
      {
        id: 'onboarding-specialist',
        name: 'Customer Onboarding',
        description: 'Guides new users through the product features.',
        role: 'ONBOARDING',
        category: 'Customer Success',
        prompt: 'You are a customer onboarding specialist...',
        capabilities: ['Product Tours', 'Account Setup', 'Training'],
      },
    ];
  }

  async createFromTemplate(tenantId: string, templateId: string) {
    const templates = this.getTemplates();
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new NotFoundException('Template not found');

    const agent = this.agentRepo.create({
      tenantId,
      name: `${template.name} (Deployed)`,
      description: template.description,
      systemPrompt: template.prompt,
      isActive: true,
      voice: 'shimmer',
      configuration: { 
        templateId, 
        role: template.role,
        category: template.category,
        capabilities: template.capabilities 
      },
    });
    return this.agentRepo.save(agent);
  }
}
