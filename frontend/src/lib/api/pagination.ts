export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CrmListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  companyId?: string;
  pipelineId?: string;
}

export const DEFAULT_PAGE_SIZE = 20;

const EMPTY_META: PaginationMeta = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  nextPage: null,
  prevPage: null,
};

export function parsePaginatedResponse<T>(response: { data?: unknown }): PaginatedResult<T> {
  const payload = response.data;

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    'meta' in payload &&
    Array.isArray((payload as PaginatedResult<T>).data)
  ) {
    return payload as PaginatedResult<T>;
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data: unknown }).data;
    if (
      nested &&
      typeof nested === 'object' &&
      'data' in nested &&
      'meta' in nested &&
      Array.isArray((nested as PaginatedResult<T>).data)
    ) {
      return nested as PaginatedResult<T>;
    }
    if (Array.isArray(nested)) {
      const data = nested as T[];
      return {
        data,
        meta: {
          page: 1,
          limit: data.length || DEFAULT_PAGE_SIZE,
          total: data.length,
          totalPages: data.length > 0 ? 1 : 0,
          nextPage: null,
          prevPage: null,
        },
      };
    }
  }

  if (Array.isArray(payload)) {
    const data = payload as T[];
    return {
      data,
      meta: {
        page: 1,
        limit: data.length || DEFAULT_PAGE_SIZE,
        total: data.length,
        totalPages: data.length > 0 ? 1 : 0,
        nextPage: null,
        prevPage: null,
      },
    };
  }

  return { data: [], meta: EMPTY_META };
}

export function buildCrmListParams(params: CrmListParams): CrmListParams {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_PAGE_SIZE,
    ...(params.search ? { search: params.search } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.companyId ? { companyId: params.companyId } : {}),
    ...(params.pipelineId ? { pipelineId: params.pipelineId } : {}),
  };
}
