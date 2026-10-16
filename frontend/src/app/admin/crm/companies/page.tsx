'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, Loader2, Globe, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { ListPagination } from '@/components/ui/ListPagination';
import { usePaginatedCrmList } from '@/hooks/usePaginatedCrmList';
import { companyService } from '@/services/company.service';

interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
}

export default function AdministrativeCompanyIntelligencePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCompanies = useCallback(
    (params: Parameters<typeof companyService.getCompanies>[0]) =>
      companyService.getCompanies(params),
    [],
  );

  const {
    items: companies,
    meta,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    reload,
  } = usePaginatedCrmList<Company>(fetchCompanies);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/companies/${editingId}`, formData);
        toast.success('Lattice block reconfigured');
      } else {
        await api.post('/crm/companies', formData);
        toast.success('Lattice block initialized');
      }
      setIsModalOpen(false);
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Configuration failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm dissolution of lattice block?')) return;
    try {
      await api.delete(`/crm/companies/${id}`);
      toast.success('Lattice dissolved');
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Dissolution failed');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', website: '', industry: '' });
    setIsModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditingId(company.id);
    setFormData({
      name: company.name,
      website: company.website || '',
      industry: company.industry || '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Company workspace
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Company Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Monitor organizational entities and their operational domains
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4" /> Initialize Lattice
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full md:max-w-md p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all shadow-inner">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search lattice name or operational domain..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
              <div
                key={company.id}
                className="p-8 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-card rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors pointer-events-none" />

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-[20px] bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 transition-all shadow-2xl">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(company)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight mb-2 leading-none">
                    {company.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-card text-muted-foreground text-xs font-semibold uppercase tracking-wide border border-border mb-6">
                    Company
                  </span>

                  <div className="space-y-4 pt-4 border-t border-border">
                    {company.website && (
                      <a
                        href={
                          company.website.startsWith('http')
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide hover:text-blue-300 transition-colors group/link"
                      >
                        <Globe className="w-4 h-4 opacity-40 shrink-0 group-hover/link:opacity-100" />{' '}
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {company.industry && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                        <User className="w-4 h-4 opacity-40 shrink-0" /> {company.industry}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {companies.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
                <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">
                  No lattice nodes detected currently.
                </p>
              </div>
            )}
          </div>
          <ListPagination meta={meta} page={page} onPageChange={setPage} />
        </div>
      )}

      {/* Lattice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-xl bg-card border border-border shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-500" />{' '}
              {editingId ? 'Reconfigure Lattice' : 'Initialize Lattice'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Company name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Network Domain (Website)
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 tracking-wide"
                    placeholder="example.com"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Market Logic (Industry)
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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
