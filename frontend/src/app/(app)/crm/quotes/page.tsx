'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  FileText,
  DollarSign,
  ChevronRight,
  User,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { ListPagination } from '@/components/ui/ListPagination';
import { usePaginatedCrmList } from '@/hooks/usePaginatedCrmList';
import { quoteService } from '@/services/quote.service';

function generateQuoteNumber(): string {
  return `QT-${Date.now()}`;
}

interface Quote {
  id: string;
  number: string;
  total: number;
  currency: string;
  status: string;
  validUntil?: string;
  contact?: { firstName: string; lastName: string };
  company?: { name: string };
  createdAt: string;
}

export default function QuotesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    number: generateQuoteNumber(),
    total: 0,
    currency: 'USD',
    status: 'DRAFT',
    validUntil: '',
  });

  const fetchQuotes = useCallback(
    (params: Parameters<typeof quoteService.getQuotes>[0]) => quoteService.getQuotes(params),
    [],
  );

  const {
    items: quotes,
    meta,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    reload,
  } = usePaginatedCrmList<Quote>(fetchQuotes);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/quotes/${editingId}`, formData);
        toast.success('Financial artifact mutated');
      } else {
        await api.post('/crm/quotes', formData);
        toast.success('Financial artifact initialized');
      }
      setIsModalOpen(false);
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Configuration failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm dissolution of financial artifact?')) return;
    try {
      await api.delete(`/crm/quotes/${id}`);
      toast.success('Artifact dissolved');
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Dissolution failed');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      number: generateQuoteNumber(),
      total: 0,
      currency: 'USD',
      status: 'DRAFT',
      validUntil: '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Financial Orchestration Active
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Quote Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage financial artifacts, revenue proposals & approval cycles
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4" /> Initialize Artifact
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full md:max-w-md p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all shadow-inner">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search financial artifact number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide mb-4">
            {error}
          </p>
          <button
            type="button"
            onClick={() => reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto text-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="p-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Artifact Identity
                    </th>
                    <th className="p-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Stakeholder Lattice
                    </th>
                    <th className="p-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Approval Phase
                    </th>
                    <th className="p-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Revenue Vector
                    </th>
                    <th className="p-6 text-right text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-xs uppercase shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all">
                            QT
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground uppercase tracking-tight">
                              {quote.number}
                            </p>
                            <p className="text-xs font-bold text-muted-foreground">
                              ID: {quote.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />{' '}
                            {quote.contact
                              ? `${quote.contact.firstName} ${quote.contact.lastName}`
                              : 'Standalone'}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />{' '}
                            {quote.company?.name || 'No Lattice'}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                            quote.status === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : quote.status === 'DRAFT'
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                                : 'bg-gray-500/10 text-muted-foreground border-gray-500/20'
                          }`}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="text-sm font-semibold text-foreground tracking-wide">
                          ${Number(quote.total || 0).toLocaleString()}
                        </div>
                        <div className="text-xs font-bold text-blue-500/60 uppercase">
                          {quote.currency}
                        </div>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="p-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-20 text-center text-muted-foreground font-semibold text-xs uppercase tracking-wide"
                      >
                        No financial artifacts detected currently.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <ListPagination meta={meta} page={page} onPageChange={setPage} />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-xl bg-card border border-border shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-8 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />{' '}
              {editingId ? 'Reconfigure Artifact' : 'Initialize Artifact'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Serial Identity
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 tracking-wide"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Revenue Target (Total)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <input
                      required
                      type="number"
                      value={formData.total}
                      onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                      className="w-full bg-card border border-border rounded-2xl pl-12 pr-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                    />
                  </div>
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Lifecycle phase
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                  >
                    <option value="DRAFT" className="bg-card">
                      Incipient (Draft)
                    </option>
                    <option value="SENT" className="bg-card">
                      Transmitted (Sent)
                    </option>
                    <option value="ACCEPTED" className="bg-card">
                      Materialized (Accepted)
                    </option>
                    <option value="DECLINED" className="bg-card">
                      Rescinded (Declined)
                    </option>
                  </select>
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Expiration Vector
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-border flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-card border-border border hover:bg-white/[0.05] text-foreground rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
