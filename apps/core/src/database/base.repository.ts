import { Repository, SelectQueryBuilder, FindManyOptions, FindOneOptions } from 'typeorm';
import { Injectable } from '@nestjs/common';

/**
 * BaseRepository — abstract base for all repositories providing tenant isolation.
 * Every repository SHOULD extend this class.
 */
@Injectable()
export abstract class BaseRepository<T extends { tenantId: string }> {
  constructor(protected readonly repository: Repository<T>) {}

  protected get baseQuery(): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder('entity');
  }

  async findAll(tenantId: string, options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      ...options,
      where: { ...options?.where, tenantId } as any,
    });
  }

  async findOne(tenantId: string, options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne({
      ...options,
      where: { ...options.where, tenantId } as any,
    });
  }

  async findById(tenantId: string, id: string): Promise<T | null> {
    return this.repository.findOne({
      where: { id, tenantId } as any,
    } as FindOneOptions<T>);
  }

  async create(tenantId: string, data: Partial<T>): Promise<T> {
    const entity = this.repository.create({ ...data, tenantId } as any);
    return this.repository.save(entity) as unknown as Promise<T>;
  }

  async update(tenantId: string, id: string, data: Partial<T>): Promise<T> {
    await this.repository.update({ id, tenantId } as any, data as any);
    const updated = await this.findById(tenantId, id);
    if (!updated) throw new Error('Entity not found after update');
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.repository.softDelete({ id, tenantId } as any);
  }
}
