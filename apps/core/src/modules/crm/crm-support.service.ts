import { Injectable } from '@nestjs/common';
import {
  ActivityRepository,
  TaskCrmRepository,
  NoteRepository,
  ProductRepository,
  QuoteRepository,
} from './crm-support.repository';

@Injectable()
export class ActivityService {
  constructor(private readonly repo: ActivityRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class TaskCrmService {
  constructor(private readonly repo: TaskCrmRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class NoteService {
  constructor(private readonly repo: NoteRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class ProductService {
  constructor(private readonly repo: ProductRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class QuoteService {
  constructor(private readonly repo: QuoteRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}
