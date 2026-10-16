'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Plus,
  Search,
  Loader2,
  LayoutGrid,
  Kanban,
  Filter,
  TrendingUp,
  DollarSign,
  Building2,
  Clock,
} from 'lucide-react';
import { DealBoard } from '@/components/crm/DealBoard';
import { ListPagination } from '@/components/ui/ListPagination';
import { usePaginatedCrmList } from '@/hooks/usePaginatedCrmList';
import { dealService } from '@/services/deal.service';
import { forecastService, type ForecastSummary } from '@/services/forecast.service';
import { pipelineService } from '@/services/pipeline.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'list';

interface DealListItem {
  id: string;
  name: string;
  value: number;
  currency?: string;
  status?: string;
  probability?: number;
  expectedCloseDate?: string;
  company?: { name: string };
}

export default function DealsPage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [pipelineMetrics, setPipelineMetrics] = useState<ForecastSummary | null>(null);

  const fetchDeals = useCallback(
    (params: Parameters<typeof dealService.getDeals>[0]) =>
      dealService.getDeals({
        ...params,
        pipelineId: selectedPipelineId || undefined,
        status: statusFilter || undefined,
      }),
    [selectedPipelineId, statusFilter],
  );

  const {
    items: listDeals,
    meta,
    page,
    setPage,
    search,
    setSearch,
    loading: listLoading,
    error: listError,
    reload: reloadList,
  } = usePaginatedCrmList<DealListItem>(fetchDeals, {
    enabled: viewMode === 'list',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pRes = await pipelineService.getPipelines();
      const pipelineList = (pRes as any).data.data || [];
      setPipelines(pipelineList);

      if (pipelineList.length > 0 && !selectedPipelineId) {
        setSelectedPipelineId(pipelineList[0].id);
      }
    } catch (error) {
      toast.error('Failed to load pipelines');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedPipelineId) {
      setPipelineMetrics(null);
      return;
    }

    forecastService
      .getForecast(selectedPipelineId)
      .then((res) => setPipelineMetrics((res as any).data.data ?? null))
      .catch(() => setPipelineMetrics(null));
  }, [selectedPipelineId]);

  useEffect(() => {
    if (listError) {
      toast.error(listError);
    }
  }, [listError]);

  const formatPipelineValue = (value: number, currency = 'USD') => {
    if (value >= 1_000_000) {
      return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${currency} ${(value / 1_000).toFixed(1)}k`;
    }
    return `${currency} ${value.toLocaleString()}`;
  };

  return (
    <div className="max-w-[1600px] min-w-0 mx-auto py-6 sm:py-12 sm:px-6">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wide mb-4">
            <Trophy className="w-3 h-3" />
            Revenue Acceleration
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
            Sales Pipeline
          </h1>
          <p className="text-muted-foreground font-bold leading-relaxed px-1">
            Orchestrate high-velocity deals and visualize your revenue trajectory in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="p-8 bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/5 flex flex-col items-center min-w-[160px] shadow-soft">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 text-center">
              Open Pipeline
            </span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                {pipelineMetrics
                  ? formatPipelineValue(pipelineMetrics.totalPipeline, pipelineMetrics.currency)
                  : '—'}
              </span>
            </div>
          </div>
          <Link
            href="/crm/deals/new"
            className="h-[100px] px-8 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
            New Deal
          </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white dark:bg-card/50 p-6 rounded-xl border border-gray-100 dark:border-white/5 shadow-soft">
        <div className="flex flex-wrap items-center gap-4 min-w-0 flex-1">
          <div className="relative max-w-sm w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Filter deals..."
              className="w-full pl-16 pr-8 py-4 bg-gray-50 dark:bg-white/5 border-none rounded-[20px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="hidden md:block h-10 w-[1px] bg-gray-100 dark:bg-white/10 mx-2" />

          <select
            aria-label="Pipeline"
            className="max-w-full bg-transparent border-none text-sm font-semibold text-gray-900 dark:text-white focus:ring-0 cursor-pointer"
            value={selectedPipelineId}
            onChange={(e) => setSelectedPipelineId(e.target.value)}
          >
            {pipelines.map((p) => (
              <option key={p.id} value={p.id} className="dark:bg-blue-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            aria-expanded={showFilters}
            aria-controls="deal-status-filter"
            className="px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-blue-600 transition flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5">
            <button
              type="button"
              aria-label="Board view"
              aria-pressed={viewMode === 'kanban'}
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-2.5 rounded-xl transition',
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-card text-blue-600 shadow-sm'
                  : 'text-muted-foreground hover:text-gray-600',
              )}
            >
              <Kanban className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2.5 rounded-xl transition',
                viewMode === 'list'
                  ? 'bg-white dark:bg-card text-blue-600 shadow-sm'
                  : 'text-muted-foreground hover:text-gray-600',
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div id="deal-status-filter" className="mb-6 flex flex-wrap items-center gap-3">
          <label htmlFor="deal-status" className="text-sm font-medium">
            Deal status
          </label>
          <select
            id="deal-status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-input bg-card px-3 py-2"
          >
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Orchestrating Pipeline...
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        <DealBoard
          pipelineId={selectedPipelineId}
          searchQuery={search}
          statusFilter={statusFilter}
        />
      ) : listLoading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Loading deals...
          </p>
        </div>
      ) : listError ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide mb-4">
            {listError}
          </p>
          <button
            type="button"
            onClick={() => reloadList()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wide"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-card overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="p-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Deal
                    </th>
                    <th className="p-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Value
                    </th>
                    <th className="p-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>
                    <th className="p-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Close Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {listDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="p-6">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {deal.name}
                        </p>
                        {deal.company?.name && (
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide flex items-center gap-2 mt-1">
                            <Building2 className="w-3 h-3" /> {deal.company.name}
                          </p>
                        )}
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {(Number(deal.value) || 0).toLocaleString()} {deal.currency ?? 'USD'}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                          {deal.status ?? 'OPEN'}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {deal.expectedCloseDate
                            ? new Date(deal.expectedCloseDate).toLocaleDateString()
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {listDeals.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-20 text-center text-muted-foreground font-semibold text-xs uppercase tracking-wide"
                      >
                        No deals found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <ListPagination
            meta={meta}
            page={page}
            onPageChange={setPage}
            className="border-gray-100 dark:border-white/5"
          />
        </div>
      )}
    </div>
  );
}
