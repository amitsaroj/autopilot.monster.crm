'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Loader2,
  LayoutGrid,
  List,
  Filter,
  Users2,
  Sparkles
} from 'lucide-react';
import { CompanyListing } from '@/components/crm/CompanyListing';
import { companyService } from '@/services/company.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await companyService.getCompanies();
      setCompanies((res as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await companyService.deleteCompany(id);
      toast.success('Company removed');
      fetchCompanies();
    } catch (error) {
      toast.error('Failed to delete company');
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            B2B Relationship Orchestration
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Organization Command</h1>
          <p className="text-gray-500 font-bold leading-relaxed px-1">Manage and scale your corporate relationships with AI-driven insights and organizational context.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-8 bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-white/5 flex flex-col items-center min-w-[140px] shadow-soft">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Accounts</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white">{companies.length}</span>
          </div>
          <button className="h-[100px] px-8 bg-indigo-600 text-white rounded-[32px] font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group">
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
            Add Account
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search organizations..." 
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-[24px] text-sm font-bold shadow-soft focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-4 bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-2xl text-gray-500 hover:text-indigo-600 transition">
            <Filter className="w-5 h-5" />
          </button>
          <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5">
            <button className="p-2.5 bg-white dark:bg-card rounded-xl text-indigo-600 shadow-sm transition">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-gray-600 transition">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Orchestrating Accounts...</p>
        </div>
      ) : (
        <CompanyListing companies={filteredCompanies} onDelete={handleDelete} />
      )}
    </div>
  );
}
