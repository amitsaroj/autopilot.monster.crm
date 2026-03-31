'use client';

import { useEffect, useState, use } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Tag, 
  Clock, 
  Save, 
  ArrowLeft,
  Loader2,
  Trash2,
  CheckCircle2,
  Globe,
  Twitter,
  Linkedin,
  Plus
} from 'lucide-react';
import { contactService, Contact } from '@/services/contact.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>({});

  const fetchContact = async () => {
    setIsLoading(true);
    try {
      const res = await contactService.getContact(id);
      const data = (res as any).data.data;
      setContact(data);
      setFormData(data);
    } catch (error) {
      toast.error('Failed to load contact');
      router.push('/crm/contacts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await contactService.updateContact(id, formData);
      toast.success('Contact updated');
      fetchContact();
    } catch (error) {
      toast.error('Failed to update contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await contactService.deleteContact(id);
      toast.success('Contact deleted');
      router.push('/crm/contacts');
    } catch (error) {
      toast.error('Failed to delete contact');
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
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/crm/contacts" 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDelete}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
            title="Delete Contact"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            type="submit"
            form="contact-form"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-card rounded-3xl border border-gray-200 dark:border-border shadow-soft p-8 text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black mb-6 shadow-xl shadow-indigo-500/30">
              {contact?.firstName[0]}{contact?.lastName[0]}
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              {contact?.firstName} {contact?.lastName}
            </h2>
            <p className="text-sm text-gray-500 mb-6">{contact?.jobTitle || 'No Title'}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {contact?.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-border">
                  {tag}
                </span>
              ))}
              <button className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-100 dark:border-indigo-800/50">
                + Add Tag
              </button>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-border">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                {contact?.email}
              </div>
              {contact?.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  {contact?.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form id="contact-form" onSubmit={handleUpdate} className="bg-white dark:bg-card rounded-3xl border border-gray-200 dark:border-border shadow-soft overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">First Name</label>
                  <input
                    required
                    value={formData.firstName || ''}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Last Name</label>
                  <input
                    required
                    value={formData.lastName || ''}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Phone</label>
                  <input
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Job Title</label>
                  <input
                    value={formData.jobTitle || ''}
                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                    placeholder="e.g. CEO"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold appearance-none"
                  >
                    <option value="LEAD">Lead</option>
                    <option value="PROSPECT">Prospect</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="CHURNED">Churned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Internal Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium h-32 resize-none"
                  placeholder="Add private notes about this contact..."
                />
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs font-bold text-gray-400 border-t border-gray-100 dark:border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Created {new Date(contact?.createdAt || '').toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Last Updated {new Date(contact?.updatedAt || '').toLocaleString()}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
