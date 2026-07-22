import { IPaginatedResult } from '../interfaces/pagination.interface';

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): IPaginatedResult<T> {
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;
  const totalPages = safeLimit > 0 ? Math.ceil(total / safeLimit) : 0;

  return {
    data,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      nextPage: safePage < totalPages ? safePage + 1 : null,
      prevPage: safePage > 1 ? safePage - 1 : null,
    },
  };
}

export function wantsPagination(query: { page?: number; limit?: number }): boolean {
  return query.page != null || query.limit != null;
}
