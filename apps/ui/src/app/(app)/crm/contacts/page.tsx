'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Link as LinkIcon,
  Loader2,
  ChevronRight,
  UserPlus,
  Tag,
  CheckCircle2,
  Upload,
  Download
} from 'lucide-react';
import { contactService, Contact } from '@/services/contact.service';
import { bulkService } from '@/services/bulk.service';
import { importExportService } from '@/services/import-export.service';
import { BulkActionBar } from '@/components/crm/BulkActionBar';
import { CsvImportModal } from '@/components/crm/CsvImportModal';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STATUS_COLORS = {
  LEAD: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50',
  PROSPECT: 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/50',
  CUSTOMER: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50',
  CHURNED: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50',
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await contactService.getContacts();
      setContacts((res as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} contacts?`)) return;
    try {
      await bulkService.delete('contact', selectedIds);
      toast.success('Contacts deleted successfully');
      setSelectedIds([]);
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete contacts');
    }
  };

  const handleBulkUpdateStatus = async (status: string) => {
    try {
      await bulkService.updateStatus('contact', selectedIds, status);
      toast.success('Status updated successfully');
      setSelectedIds([]);
      fetchContacts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await importExportService.exportData('contact');
      const csv = (res as any).data.data;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `contacts_export_${new Date().getTime()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Contacts exported successfully');
    } catch (error) {
      toast.error('Failed to export contacts');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Contacts</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your leads and customers efficiently.</p>
        </div>
        <div className="flex items-center gap-3">
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
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-card/50 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-border bg-gray-50/30 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-input bg-white/50 dark:bg-background/50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-input bg-white/50 dark:bg-background/50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="LEAD">Leads</option>
              <option value="PROSPECT">Prospects</option>
              <option value="CUSTOMER">Customers</option>
              <option value="CHURNED">Churned</option>
            </select>
            <button className="p-2 border border-gray-300 dark:border-input rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-card/50 border-b border-gray-200 dark:border-border">
                <th className="px-6 py-4 w-10">
                  <div 
                    onClick={() => setSelectedIds(selectedIds.length === filteredContacts.length ? [] : filteredContacts.map(c => c.id))}
                    className={cn(
                      "w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition",
                      selectedIds.length === filteredContacts.length ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                    )}
                  >
                    {selectedIds.length === filteredContacts.length && selectedIds.length > 0 && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company & Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-border whitespace-nowrap">
              {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
                <tr 
                  key={contact.id} 
                  className={cn(
                    "hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition group",
                    selectedIds.includes(contact.id) ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                  )}
                >
                  <td className="px-6 py-4">
                    <div 
                      onClick={() => toggleSelect(contact.id)}
                      className={cn(
                        "w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition",
                        selectedIds.includes(contact.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {selectedIds.includes(contact.id) && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-indigo-800/50">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <Link 
                          href={`/crm/contacts/${contact.id}`}
                          className="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 transition"
                        >
                          {contact.firstName} {contact.lastName}
                        </Link>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>
                          {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="text-gray-900 dark:text-white font-medium">{contact.jobTitle || '-'}</p>
                    <p className="text-xs text-gray-500">{contact.companyId ? 'Associated Company' : 'Individual'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border",
                      STATUS_COLORS[contact.status as keyof typeof STATUS_COLORS]
                    )}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {contact.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                      {contact.tags?.length > 2 && <span className="text-[9px] text-gray-400">+{contact.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <Link 
                        href={`/crm/contacts/${contact.id}`}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-indigo-600 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Users className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">No contacts found building your first sequence?</p>
                      <button 
                        onClick={() => fetchContacts()}
                        className="text-xs text-indigo-600 hover:underline font-bold"
                      >
                        Refresh list
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.length}
        entityType="contact"
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
        onUpdateStatus={handleBulkUpdateStatus}
      />

      <CsvImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchContacts}
        entityType="contact"
      />
    </div>
  );
}
