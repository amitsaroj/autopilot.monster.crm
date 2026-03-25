'use client';

import { useEffect, useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Upload,
  Download,
  Mail,
  Phone,
  BarChart3,
  Star
} from 'lucide-react';
import { leadService, Lead, LeadStatus } from '@/services/lead.service';
import { bulkService } from '@/services/bulk.service';
import { importExportService } from '@/services/import-export.service';
import { BulkActionBar } from '@/components/crm/BulkActionBar';
import { CsvImportModal } from '@/components/crm/CsvImportModal';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await leadService.getLeads();
      setLeads((res as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const statuses = ['All', ...Object.values(LeadStatus)];

  const filteredLeads = leads.filter(lead => {
    const fullName = `${lead.firstName} ${lead.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                         lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.phone.includes(searchQuery);
    const matchesStatus = selectedStatus === 'All' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-red-500 bg-red-50 border-red-100";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case LeadStatus.QUALIFIED: return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case LeadStatus.CONVERTED: return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case LeadStatus.NEW: return "bg-blue-50 text-blue-600 border-blue-100";
      case LeadStatus.CONTACTED: return "bg-amber-50 text-amber-600 border-amber-100";
      case LeadStatus.UNQUALIFIED: return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) return;
    try {
      await bulkService.delete('lead', selectedIds);
      toast.success('Leads deleted successfully');
      setSelectedIds([]);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to delete leads');
    }
  };

  const handleBulkUpdateStatus = async (status: string) => {
    try {
      await bulkService.updateStatus('lead', selectedIds, status);
      toast.success('Status updated successfully');
      setSelectedIds([]);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await importExportService.exportData('lead');
      const csv = (res as any).data.data;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `leads_export_${new Date().getTime()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Leads exported successfully');
    } catch (error) {
      toast.error('Failed to export leads');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const averageScore = leads.length > 0 ? leads.reduce((sum, l) => sum + l.score, 0) / leads.length : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Leads Engine</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">AI-driven prospect prioritization and conversion.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end mr-6 pr-6 border-r border-gray-100 dark:border-border">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Health</span>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xl font-black text-gray-900 dark:text-white">{averageScore.toFixed(0)}%</span>
            </div>
          </div>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-card border border-gray-100 dark:border-white/5 text-gray-700 dark:text-white rounded-2xl font-bold text-sm transition hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-card border border-gray-100 dark:border-white/5 text-gray-700 dark:text-white rounded-2xl font-bold text-sm transition hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition shadow-xl shadow-indigo-500/20">
            <UserPlus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
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
        {filteredLeads.map(lead => (
          <div key={lead.id} className="relative group">
            <div 
              onClick={(e) => toggleSelect(lead.id, e)}
              className={cn(
                "absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-lg border-2 cursor-pointer transition flex items-center justify-center bg-white",
                selectedIds.includes(lead.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 opacity-0 group-hover:opacity-100"
              )}
            >
              {selectedIds.includes(lead.id) && <CheckCircle2 className="w-3 h-3" />}
            </div>
            
            <Link 
              href={`/crm/leads/${lead.id}`}
              className={cn(
                "flex flex-col lg:flex-row lg:items-center gap-6 p-6 bg-white dark:bg-card rounded-[32px] border transition cursor-pointer shadow-soft hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/50",
                selectedIds.includes(lead.id) ? "border-indigo-600 ring-2 ring-indigo-500/10" : "border-gray-100 dark:border-border"
              )}
            >
              <div className="flex items-center gap-4 lg:w-1/4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition">
                    {lead.firstName} {lead.lastName}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">
                    {lead.email || 'No email provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 flex-1">
                <div className="flex items-center gap-4 min-w-[140px]">
                  <div className={cn(
                    "w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0",
                    getScoreColor(lead.score)
                  )}>
                    <span className="text-xs font-black">{lead.score}</span>
                    <span className="text-[8px] font-black uppercase opacity-60">Score</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5",
                    getStatusColor(lead.status as string)
                  )}>
                    {lead.status}
                  </div>
                </div>

                <div className="hidden xl:flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Phone className="w-4 h-4 text-gray-300" />
                    {lead.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Clock className="w-4 h-4 text-gray-300" />
                    Joined {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end lg:w-1/4 gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-card bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition -mr-2" />
              </div>
            </Link>
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-border rounded-[40px] bg-gray-50/50">
            <Zap className="w-12 h-12 mb-4 text-gray-200" />
            <h3 className="text-lg font-black text-gray-400 mb-1">No Leads Found</h3>
            <p className="text-sm text-gray-400">Start capturing leads to fuel your sales pipeline.</p>
          </div>
        )}
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.length}
        entityType="lead"
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
        onUpdateStatus={handleBulkUpdateStatus}
      />

      <CsvImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchLeads}
        entityType="lead"
      />
    </div>
  );
}
