'use client';

import { useEffect, useState, use } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Trash2, 
  Save, 
  ArrowLeft,
  Loader2,
  Zap,
  Globe,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  BarChart3,
  Star,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { leadService, Lead, LeadStatus } from '@/services/lead.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await leadService.getLead(id);
      const data = (res as any).data.data;
      setLead(data);
      setFormData(data);
    } catch (error) {
      toast.error('Failed to load lead details');
      router.push('/crm/leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await leadService.updateLead(id, formData);
      toast.success('Lead updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!confirm('Convert this lead to a contact and deal?')) return;
    setIsConverting(true);
    try {
      await leadService.convertLead(id);
      toast.success('Lead converted to Contact & Deal');
      router.push('/crm/contacts');
    } catch (error) {
      toast.error('Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-red-500 bg-red-50 border-red-100";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/crm/leads" 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads Engine
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleConvert}
            disabled={isConverting || formData.status === LeadStatus.CONVERTED}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Convert Lead
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Header Profile */}
          <div className="bg-white dark:bg-card rounded-[40px] border border-gray-100 dark:border-border shadow-soft p-10 lg:p-14">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                  <User className="w-16 h-16" />
                </div>
                <div className={cn(
                  "absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl border-4 border-white dark:border-card flex flex-col items-center justify-center shadow-xl",
                  getScoreColor(lead?.score || 0)
                )}>
                  <span className="text-xs font-black">{lead?.score}</span>
                  <span className="text-[7px] font-black uppercase opacity-60">AI Score</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
                    formData.status === LeadStatus.QUALIFIED ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
                  )}>
                    {formData.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    {formData.email || 'Add email address'}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    {formData.phone || 'Add phone number'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Intelligence Section */}
          <div className="bg-white dark:bg-card rounded-[40px] border border-gray-100 dark:border-border shadow-soft p-10 lg:p-14 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8">
              <Zap className="w-16 h-16 text-indigo-50 opacity-5 dark:opacity-10 scale-150 rotate-12" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Lead Intelligence</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI-Generated Insights & Prioritization</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="p-6 rounded-[32px] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-border">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Sentiment Analysis</p>
                <div className="flex items-end gap-2">
                  <div className="h-2 flex-1 rounded-full bg-emerald-500" style={{ width: '80%' }}></div>
                  <span className="text-xs font-black text-emerald-600">80% Positive</span>
                </div>
              </div>
              <div className="p-6 rounded-[32px] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-border">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Intent Level</p>
                <div className="flex items-end gap-2 text-indigo-600">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">High Purchase Intent</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">AI Executive Summary</label>
              <div className="bg-gray-50/30 dark:bg-gray-900/30 rounded-[32px] p-8 border border-gray-100 dark:border-border">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                  "{formData.aiSummary || 'Waiting for AI processing...'}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-border shadow-soft p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Pipeline Status</h3>
            <div className="space-y-4">
              {Object.values(LeadStatus).map(status => (
                <button
                  key={status}
                  onClick={() => setFormData({ ...formData, status })}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-between",
                    formData.status === status 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 border border-transparent hover:border-gray-100 dark:hover:border-border"
                  )}
                >
                  {status}
                  {formData.status === status && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-border shadow-soft p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Metadata</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-border">
                <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Source Channel</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">Direct Website</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-border">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Capture Date</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">{new Date(lead!.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
