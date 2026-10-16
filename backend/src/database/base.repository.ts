import { Repository, SelectQueryBuilder, FindManyOptions, FindOneOptions } from 'typeorm';
import { Injectable } from '@nestjs/common';

/** Columns a caller must never be able to set through a create/update payload. */
export const IMMUTABLE_FIELDS = ['id', 'tenantId', 'createdAt', 'updatedAt', 'deletedAt'] as const;

/**
 * Returns a shallow copy of `data` without identity/ownership/timestamp keys,
 * so a request body can never re-home a row to another tenant or overwrite
 * its primary key. Use at every site that spreads user input into an entity.
 */
export function stripImmutableFields<D extends object>(
  data: D,
): Omit<D, (typeof IMMUTABLE_FIELDS)[number]> {
  const copy = { ...data } as Record<string, unknown>;
  for (const key of IMMUTABLE_FIELDS) delete copy[key];
  return copy as Omit<D, (typeof IMMUTABLE_FIELDS)[number]>;
}

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

  async findAndCount(tenantId: string, options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount({
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
    const entity = this.repository.create({ ...stripImmutableFields(data), tenantId } as any);
    return this.repository.save(entity) as unknown as Promise<T>;
  }

  async updateWithTenant(tenantId: string, id: string, data: Partial<T>): Promise<T> {
    await this.repository.update({ id, tenantId } as any, stripImmutableFields(data) as any);
    const updated = await this.findById(tenantId, id);
    if (!updated) throw new Error('Entity not found after update');
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.repository.softDelete({ id, tenantId } as any);
  }
}
