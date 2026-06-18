import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { BaseRepository } from '../../database/base.repository';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from './dto/knowledge-base.dto';

@Injectable()
export class KnowledgeBaseRepository extends BaseRepository<KnowledgeBase> {
  constructor(@InjectRepository(KnowledgeBase) repo: Repository<KnowledgeBase>) {
    super(repo);
  }
}

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly repo: KnowledgeBaseRepository) {}

  create(tenantId: string, dto: CreateKnowledgeBaseDto) {
    return this.repo.create(tenantId, {
      name: dto.name,
      description: dto.description,
      sourceType: dto.sourceType,
      sourceConfig: dto.sourceConfig ?? {},
      status: 'PROCESSING',
    });
  }

  findAll(tenantId: string) {
    return this.repo.findAll(tenantId);
  }

  findOne(tenantId: string, id: string) {
    return this.repo.findById(tenantId, id);
  }

  async update(tenantId: string, id: string, dto: UpdateKnowledgeBaseDto) {
    const kb = await this.repo.findById(tenantId, id);
    if (!kb) {
      throw new NotFoundException('Knowledge base not found');
    }
    return this.repo.updateWithTenant(tenantId, id, dto);
  }

  remove(tenantId: string, id: string) {
    return this.repo.delete(tenantId, id);
  }

  async sync(tenantId: string, id: string) {
    const kb = await this.repo.findById(tenantId, id);
    if (!kb) {
      throw new NotFoundException('Knowledge base not found');
    }
    return this.repo.updateWithTenant(tenantId, id, { status: 'PROCESSING' });
  }

  async removeDocument(tenantId: string, id: string, docId: string) {
    const kb = await this.repo.findById(tenantId, id);
    if (!kb) {
      throw new NotFoundException('Knowledge base not found');
    }

    const indexMeta = { ...kb.indexMeta };
    const documents = (indexMeta.documents as Array<{ id: string }> | undefined) ?? [];
    indexMeta.documents = documents.filter((doc) => doc.id !== docId);

    return this.repo.updateWithTenant(tenantId, id, { indexMeta });
  }
}
