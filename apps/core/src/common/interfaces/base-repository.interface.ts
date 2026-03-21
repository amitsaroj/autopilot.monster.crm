/**
 * Generic base repository interface.
 * All repositories in every module must implement this.
 */
export interface IBaseRepository<T, CreateDto, UpdateDto> {
  findById(id: string, tenantId: string): Promise<T | null>;
  findAll(tenantId: string, options?: PaginationOptions): Promise<T[]>;
  create(dto: CreateDto, tenantId: string, actorId: string): Promise<T>;
  update(id: string, dto: UpdateDto, tenantId: string, actorId: string): Promise<T>;
  softDelete(id: string, tenantId: string, actorId: string): Promise<void>;
  hardDelete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
