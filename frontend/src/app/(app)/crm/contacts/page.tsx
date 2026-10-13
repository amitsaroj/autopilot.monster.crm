'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, Loader2, User, Mail, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { DialogShell } from '@/components/ui/dialog-shell';
import { ListPagination } from '@/components/ui/ListPagination';
import { usePaginatedCrmList } from '@/hooks/usePaginatedCrmList';
import { parsePaginatedResponse } from '@/lib/api/pagination';
import { companyService } from '@/services/company.service';
import { contactService } from '@/services/contact.service';

interface Company {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: string;
  company?: Company;
  status: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchContacts = useCallback(
    (params: Parameters<typeof contactService.getContacts>[0]) =>
      contactService.getContacts(params),
    [],
  );

  const {
    items: contacts,
    meta,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    reload,
  } = usePaginatedCrmList<Contact>(fetchContacts);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyId: '',
  });

  useEffect(() => {
    companyService
      .getCompanies({ page: 1, limit: 100 })
      .then((res) => setCompanies(parsePaginatedResponse<Company>(res).data))
      .catch(() => toast.error('Failed to load companies'));
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/contacts/${editingId}`, formData);
        toast.success('Contact updated');
      } else {
        await api.post('/crm/contacts', formData);
        toast.success('Contact created');
      }
      setIsModalOpen(false);
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Unable to save contact');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact? This action cannot be undone.')) return;
    try {
      await api.delete(`/crm/contacts/${id}`);
      toast.success('Contact deleted');
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Unable to delete contact');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', companyId: '' });
    setIsModalOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || '',
      companyId: contact.companyId || '',
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
              Customer workspace
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Contacts
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage your customer relationships and contact details.
          </p>
        </div>
        <button onClick={openCreate} className="product-button product-button-primary">
          <Plus className="w-4 h-4" /> Add contact
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full md:max-w-md p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all shadow-inner">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            aria-label="Search contacts"
            placeholder="Search contacts…"
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
          <div className="product-panel overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <caption className="sr-only">
                Contacts with company, communication details, and record actions
              </caption>
              <thead>
                <tr className="border-b border-border">
                  {['Contact', 'Company', 'Phone', 'Status', 'Actions'].map((label) => (
                    <th key={label} scope="col" className="px-5 py-3 text-left">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((contact) => {
                  const company =
                    companies.find((item) => item.id === contact.companyId) || contact.company;
                  return (
                    <tr key={contact.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full bg-accent text-primary flex items-center justify-center font-semibold shrink-0">
                            {contact.firstName?.[0]}
                          </span>
                          <div>
                            <Link
                              href={`/crm/contacts/${contact.id}`}
                              className="font-semibold hover:text-primary"
                            >
                              {contact.firstName} {contact.lastName}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{company?.name || '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground">{contact.phone || '—'}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-2 py-1 rounded-md bg-muted text-xs font-medium">
                          {contact.status || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(contact)}
                            aria-label={`Edit ${contact.firstName} ${contact.lastName}`}
                            className="p-2.5 rounded-lg hover:bg-accent text-muted-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            aria-label={`Delete ${contact.firstName} ${contact.lastName}`}
                            className="p-2.5 rounded-lg hover:bg-red-50 text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center px-6 py-16 text-muted-foreground">
                      No contacts found. Add a contact or adjust your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <ListPagination meta={meta} page={page} onPageChange={setPage} />
        </div>
      )}

      {/* Identity Modal */}
      <DialogShell
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingId ? 'Edit contact' : 'Add contact'}
      >
        <div className="w-full max-w-xl max-h-[90dvh] overflow-y-auto p-5 sm:p-8 rounded-xl bg-card border border-border shadow-2xl animate-in zoom-in-95">
          <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-8 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-500" /> {editingId ? 'Edit contact' : 'Add contact'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 space-y-2">
                <label
                  htmlFor="contact-firstName"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1"
                >
                  First name
                </label>
                <input
                  id="contact-firstName"
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label
                  htmlFor="contact-lastName"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1"
                >
                  Last name
                </label>
                <input
                  id="contact-lastName"
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label
                  htmlFor="contact-email"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label
                  htmlFor="contact-phone"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1"
                >
                  Phone
                </label>
                <input
                  id="contact-phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 tracking-wide"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label
                  htmlFor="contact-companyId"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1"
                >
                  Company
                </label>
                <select
                  id="contact-companyId"
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-card">
                    No company
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-card">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-6 border-t border-border flex gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-card border-border border hover:bg-white/[0.05] text-foreground rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20"
              >
                Save contact
              </button>
            </div>
          </form>
        </div>
      </DialogShell>
    </div>
  );
}
