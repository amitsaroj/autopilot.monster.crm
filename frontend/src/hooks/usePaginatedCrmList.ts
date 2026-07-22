'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import {
  buildCrmListParams,
  DEFAULT_PAGE_SIZE,
  parsePaginatedResponse,
  type CrmListParams,
  type PaginationMeta,
} from '@/lib/api/pagination';

const EMPTY_META: PaginationMeta = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  nextPage: null,
  prevPage: null,
};

interface UsePaginatedCrmListOptions {
  limit?: number;
  debounceMs?: number;
  status?: string;
  companyId?: string;
  pipelineId?: string;
  enabled?: boolean;
}

export function usePaginatedCrmList<T>(
  fetcher: (params: CrmListParams) => Promise<AxiosResponse<unknown>>,
  options?: UsePaginatedCrmListOptions,
) {
  const limit = options?.limit ?? DEFAULT_PAGE_SIZE;
  const debounceMs = options?.debounceMs ?? 300;

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, debounceMs);
    return () => clearTimeout(timeout);
  }, [search, debounceMs]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildCrmListParams({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: options?.status,
        companyId: options?.companyId,
        pipelineId: options?.pipelineId,
      });
      const response = await fetcher(params);
      const parsed = parsePaginatedResponse<T>(response);
      setItems(parsed.data);
      setMeta(parsed.meta);
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? 'Failed to load data');
      setItems([]);
      setMeta(EMPTY_META);
    } finally {
      setLoading(false);
    }
  }, [
    fetcher,
    page,
    limit,
    debouncedSearch,
    options?.status,
    options?.companyId,
    options?.pipelineId,
  ]);

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }
    void reload();
  }, [reload, options?.enabled]);

  return {
    items,
    meta,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    reload,
  };
}
