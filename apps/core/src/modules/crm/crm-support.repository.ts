import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../../database/entities/activity.entity';
import { Task } from '../../database/entities/task.entity';
import { Note } from '../../database/entities/note.entity';
import { Product } from '../../database/entities/product.entity';
import { Quote } from '../../database/entities/quote.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class ActivityRepository extends BaseRepository<Activity> {
  constructor(@InjectRepository(Activity) repo: Repository<Activity>) {
    super(repo);
  }
}

@Injectable()
export class TaskCrmRepository extends BaseRepository<Task> {
  constructor(@InjectRepository(Task) repo: Repository<Task>) {
    super(repo);
  }
}

@Injectable()
export class NoteRepository extends BaseRepository<Note> {
  constructor(@InjectRepository(Note) repo: Repository<Note>) {
    super(repo);
  }
}

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(@InjectRepository(Product) repo: Repository<Product>) {
    super(repo);
  }
}

@Injectable()
export class QuoteRepository extends BaseRepository<Quote> {
  constructor(@InjectRepository(Quote) repo: Repository<Quote>) {
    super(repo);
  }
}
