'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/lib/api/pagination';

interface ListPaginationProps {
  meta: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function ListPagination({ meta, page, onPageChange, className }: ListPaginationProps) {
  if (meta.total === 0) {
    return null;
  }

  const start = (page - 1) * meta.limit + 1;
  const end = Math.min(page * meta.limit, meta.total);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.05]',
        className,
      )}
    >
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
        Showing {start}–{end} of {meta.total}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={meta.prevPage == null}
          onClick={() => meta.prevPage != null && onPageChange(meta.prevPage)}
          className="p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[100px] text-center">
          Page {page} / {Math.max(meta.totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={meta.nextPage == null}
          onClick={() => meta.nextPage != null && onPageChange(meta.nextPage)}
          className="p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
