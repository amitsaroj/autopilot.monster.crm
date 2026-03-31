'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Printer,
  Share2,
  Calendar,
  Building2,
  User
} from 'lucide-react';
import { quoteService, Quote, QuoteStatus } from '@/services/quote.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const res = await quoteService.getQuotes();
      setQuotes((res as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const statuses = ['All', ...Object.values(QuoteStatus)];

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         quote.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || quote.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.ACCEPTED: return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case QuoteStatus.DECLINED: return "bg-red-50 text-red-600 border-red-100";
      case QuoteStatus.SENT: return "bg-blue-50 text-blue-600 border-blue-100";
      case QuoteStatus.VIEWED: return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case QuoteStatus.EXPIRED: return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  const StatusIcon = ({ status }: { status: QuoteStatus }) => {
    switch (status) {
      case QuoteStatus.ACCEPTED: return <CheckCircle2 className="w-3.5 h-3.5" />;
      case QuoteStatus.DECLINED: return <XCircle className="w-3.5 h-3.5" />;
      case QuoteStatus.SENT: return <Share2 className="w-3.5 h-3.5" />;
      case QuoteStatus.VIEWED: return <Clock className="w-3.5 h-3.5" />;
      case QuoteStatus.EXPIRED: return <AlertCircle className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const totalValue = filteredQuotes.reduce((sum, q) => sum + Number(q.total), 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Sales Quotes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track revenue generation and document approvals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end mr-6 pr-6 border-r border-gray-100 dark:border-border">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pipeline Value</span>
            <span className="text-xl font-black text-indigo-600">${totalValue.toLocaleString()}</span>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition shadow-xl shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            New Quote
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by quote number or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card shadow-soft text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "px-6 py-4 rounded-2xl font-bold text-xs whitespace-nowrap transition border",
                selectedStatus === status 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-white dark:bg-card border-gray-100 dark:border-border text-gray-500 hover:border-indigo-200"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuotes.map(quote => (
          <Link 
            key={quote.id}
            href={`/crm/quotes/${quote.id}`}
            className="group flex flex-col lg:flex-row lg:items-center gap-6 p-6 bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-border shadow-soft hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-4 lg:w-1/4">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition">
                  {quote.number}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Created {new Date(quote.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 flex-1">
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className={cn(
                  "px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5",
                  getStatusColor(quote.status)
                )}>
                  <StatusIcon status={quote.status} />
                  {quote.status}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <User className="w-4 h-4 text-gray-300" />
                  John Doe
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Calendar className="w-4 h-4 text-gray-300" />
                  Expires {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end lg:w-1/4 gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Total Amount</p>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-xl font-black text-gray-900 dark:text-white">${Number(quote.total).toLocaleString()}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase">{quote.currency}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition -mr-2" />
            </div>
          </Link>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-border rounded-[40px] bg-gray-50/50">
            <FileText className="w-12 h-12 mb-4 text-gray-200" />
            <h3 className="text-lg font-black text-gray-400 mb-1">No Quotes Found</h3>
            <p className="text-sm text-gray-400">Start by creating a professional quote for your active deals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
