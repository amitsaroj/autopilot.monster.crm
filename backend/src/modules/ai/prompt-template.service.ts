import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptTemplate } from '../../database/entities/prompt-template.entity';

@Injectable()
export class PromptTemplateService {
  constructor(
    @InjectRepository(PromptTemplate)
    private readonly templateRepo: Repository<PromptTemplate>,
  ) {}

  async create(tenantId: string, dto: Partial<PromptTemplate>): Promise<PromptTemplate> {
    const template = this.templateRepo.create({ ...dto, tenantId } as any) as unknown as PromptTemplate;
    return this.templateRepo.save(template) as unknown as Promise<PromptTemplate>;
  }

  async findAll(tenantId: string, category?: string): Promise<PromptTemplate[]> {
    const where: any = { tenantId };
    if (category) where.category = category;
    return this.templateRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<PromptTemplate> {
    const t = await this.templateRepo.findOne({ where: { id, tenantId } as any });
    if (!t) throw new NotFoundException('Prompt template not found');
    return t;
  }

  async render(tenantId: string, id: string, variables: Record<string, string>): Promise<string> {
    const t = await this.findOne(tenantId, id);
    let result = t.template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  async update(tenantId: string, id: string, dto: Partial<PromptTemplate>): Promise<PromptTemplate> {
    const t = await this.findOne(tenantId, id);
    Object.assign(t, dto);
    return this.templateRepo.save(t) as unknown as Promise<PromptTemplate>;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const t = await this.findOne(tenantId, id);
    await this.templateRepo.softRemove(t);
  }
}
