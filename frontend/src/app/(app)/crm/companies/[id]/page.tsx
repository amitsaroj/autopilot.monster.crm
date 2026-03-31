'use client';

import { useEffect, useState, use } from 'react';
import { 
  Building2, 
  Globe, 
  Phone, 
  Briefcase, 
  Tag, 
  Clock, 
  Save, 
  ArrowLeft,
  Loader2,
  Trash2,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Users,
  ExternalLink
} from 'lucide-react';
import { companyService, Company } from '@/services/company.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});

  const fetchCompany = async () => {
    setIsLoading(true);
    try {
      const res = await companyService.getCompany(id);
      const data = (res as any).data.data;
      setCompany(data);
      setFormData(data);
    } catch (error) {
      toast.error('Failed to load company');
      router.push('/crm/companies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await companyService.updateCompany(id, formData);
      toast.success('Company updated');
      fetchCompany();
    } catch (error) {
      toast.error('Failed to update company');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
      await companyService.deleteCompany(id);
      toast.success('Company deleted');
      router.push('/crm/companies');
    } catch (error) {
      toast.error('Failed to delete company');
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
          href="/crm/companies" 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDelete}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
            title="Delete Company"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            type="submit"
            form="company-form"
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
            <div className="w-24 h-24 mx-auto rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-4xl font-black mb-6 shadow-xl shadow-indigo-500/30">
              <Building2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              {company?.name}
            </h2>
            <p className="text-sm text-gray-500 mb-6">{company?.industry || 'Unspecified Industry'}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {company?.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-border">
                  {tag}
                </span>
              ))}
              <button className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-100 dark:border-indigo-800/50">
                + Add Tag
              </button>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-border text-left">
              {company?.website && (
                <a 
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition"
                >
                  <Globe className="w-4 h-4" />
                  {company.website}
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
              )}
              {company?.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                {company?.city ? `${company.city}, ${company.country}` : 'No Address'}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/30">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-200" />
              Intelligence
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-100">Revenue</span>
                <span className="font-bold">{company?.annualRevenueRange || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-100">Company Size</span>
                <span className="font-bold">{company?.sizeRange || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form id="company-form" onSubmit={handleUpdate} className="bg-white dark:bg-card rounded-3xl border border-gray-200 dark:border-border shadow-soft overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Company Name</label>
                <input
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Domain</label>
                  <input
                    value={formData.domain || ''}
                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                    placeholder="example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Website</label>
                  <input
                    value={formData.website || ''}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Industry</label>
                  <input
                    value={formData.industry || ''}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                    placeholder="e.g. Technology"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Size Range</label>
                  <select
                    value={formData.sizeRange}
                    onChange={e => setFormData({ ...formData, sizeRange: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold appearance-none"
                  >
                    <option value="">Select Size...</option>
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="501-1000">501-1000 Employees</option>
                    <option value="1000+">1000+ Employees</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">City</label>
                  <input
                    value={formData.city || ''}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Country</label>
                  <input
                    value={formData.country || ''}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs font-bold text-gray-400 border-t border-gray-100 dark:border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Registered {new Date(company?.createdAt || '').toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Last Verified 2d ago
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
