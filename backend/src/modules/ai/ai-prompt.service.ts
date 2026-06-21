import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiPrompt } from '../../database/entities/ai-prompt.entity';
import { CreateAiPromptDto, UpdateAiPromptDto } from './dto/ai-agent.dto';

@Injectable()
export class AiPromptService {
  constructor(
    @InjectRepository(AiPrompt)
    private readonly promptRepository: Repository<AiPrompt>,
  ) {}

  findAll(tenantId: string): Promise<AiPrompt[]> {
    return this.promptRepository.find({
      where: { tenantId },
      order: { isFavorite: 'DESC', updatedAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<AiPrompt> {
    const prompt = await this.promptRepository.findOne({ where: { id, tenantId } });
    if (!prompt) {
      throw new NotFoundException('Prompt not found');
    }
    return prompt;
  }

  create(tenantId: string, dto: CreateAiPromptDto): Promise<AiPrompt> {
    return this.promptRepository.save(
      this.promptRepository.create({
        tenantId,
        name: dto.name,
        content: dto.content,
        category: dto.category,
        tags: dto.tags ?? [],
        isFavorite: dto.isFavorite ?? false,
      }),
    );
  }

  async update(tenantId: string, id: string, dto: UpdateAiPromptDto): Promise<AiPrompt> {
    const prompt = await this.findOne(tenantId, id);
    if (dto.name !== undefined) prompt.name = dto.name;
    if (dto.content !== undefined) prompt.content = dto.content;
    if (dto.category !== undefined) prompt.category = dto.category;
    if (dto.tags !== undefined) prompt.tags = dto.tags;
    if (dto.isFavorite !== undefined) prompt.isFavorite = dto.isFavorite;
    return this.promptRepository.save(prompt);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.promptRepository.softDelete({ id, tenantId });
  }
}
