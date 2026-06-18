import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lead } from '../../database/entities/lead.entity';
import { LeadScoringService } from './lead-scoring.service';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  async findAll(tenantId: string) {
    return this.leadRepo.find({ where: { tenantId } });
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.leadRepo.findOne({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async create(tenantId: string, data: Partial<Lead>) {
    const score = this.leadScoringService.computeScore(data);
    const lead = this.leadRepo.create({ ...data, tenantId, score });
    return this.leadRepo.save(lead);
  }

  async bulkCreate(tenantId: string, leads: Partial<Lead>[]) {
    const leadEntities = leads.map((l) =>
      this.leadRepo.create({
        ...l,
        tenantId,
        score: this.leadScoringService.computeScore(l),
      }),
    );
    return this.leadRepo.save(leadEntities);
  }

  async update(tenantId: string, id: string, data: Partial<Lead>) {
    const existing = await this.findOne(tenantId, id);
    const merged = { ...existing, ...data };
    const score = this.leadScoringService.computeScore(merged);
    await this.leadRepo.update({ id, tenantId }, { ...data, score });
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.leadRepo.delete({ id, tenantId });
  }
}
