import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class KnowledgeBaseRepository extends BaseRepository<KnowledgeBase> {
  constructor(@InjectRepository(KnowledgeBase) repo: Repository<KnowledgeBase>) {
    super(repo);
  }
}

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly repo: KnowledgeBaseRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  findOne(tid: string, id: string) {
    return this.repo.findById(tid, id);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}
