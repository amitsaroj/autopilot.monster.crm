'use client';

import { useEffect, useState, use } from 'react';
import { 
  BarChart3, 
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
  Target,
  ChevronRight,
  DollarSign,
  Calendar,
  Building2,
  User
} from 'lucide-react';
import { dealService, Deal } from '@/services/deal.service';
import { pipelineService, Pipeline, Stage } from '@/services/pipeline.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Deal>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dealRes, pipelineRes] = await Promise.all([
        dealService.getDeal(id),
        pipelineService.getDefaultPipeline()
      ]);
      const dealData = (dealRes as any).data.data;
      setDeal(dealData);
      setFormData(dealData);
      setPipeline((pipelineRes as any).data.data);
    } catch (error) {
      toast.error('Failed to load deal details');
      router.push('/crm/deals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dealService.updateDeal(id, formData);
      toast.success('Deal updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update deal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await dealService.deleteDeal(id);
      toast.success('Deal deleted');
      router.push('/crm/deals');
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const currentStage = pipeline?.stages.find(s => s.id === formData.stageId);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/crm/deals" 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Kanban
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDelete}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
            title="Delete Deal"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            type="submit"
            form="deal-form"
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
            <div className="w-24 h-24 mx-auto rounded-3xl bg-emerald-600 flex items-center justify-center text-white text-4xl font-black mb-6 shadow-xl shadow-emerald-500/30 font-serif">
              $
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              {deal?.name}
            </h2>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-6 uppercase tracking-widest text-[10px]">
              {currentStage?.name || 'Unmapped Stage'}
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {deal?.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-border">
                  {tag}
                </span>
              ))}
              {deal?.status !== 'OPEN' && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold border",
                  deal?.status === 'WON' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                )}>
                  {deal?.status}
                </span>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-border text-left">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-white">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                {Number(deal?.value).toLocaleString()} {deal?.currency}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Target className="w-4 h-4 text-indigo-500" />
                {formData.probability}% Probability
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 text-orange-500" />
                Exp. Close: {deal?.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-3xl border border-gray-200 dark:border-border shadow-soft p-6">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Associations
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-card flex items-center justify-center border border-gray-100 dark:border-border">
                    <Building2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-xs font-bold truncate max-w-[120px]">Account Entity</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-card flex items-center justify-center border border-gray-100 dark:border-border">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-xs font-bold truncate max-w-[120px]">Primary Contact</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form id="deal-form" onSubmit={handleUpdate} className="bg-white dark:bg-card rounded-3xl border border-gray-200 dark:border-border shadow-soft overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Deal Name</label>
                <input
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Pipeline Stage</label>
                  <select
                    value={formData.stageId}
                    onChange={e => setFormData({ ...formData, stageId: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold appearance-none"
                  >
                    {pipeline?.stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Deal Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold appearance-none"
                  >
                    <option value="OPEN">Open</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Value ({formData.currency})</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.value || 0}
                      onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                      className="w-full pl-10 pr-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Probability (%)</label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    value={formData.probability || 0}
                    onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Expected Close Date</label>
                  <input
                    type="date"
                    value={formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().split('T')[0] : ''}
                    onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                  />
                </div>
                {formData.status === 'LOST' && (
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Lost Reason</label>
                    <input
                      value={formData.lostReason || ''}
                      onChange={e => setFormData({ ...formData, lostReason: e.target.value })}
                      className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                      placeholder="e.g. Price too high"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs font-bold text-gray-400 border-t border-gray-100 dark:border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Created {new Date(deal?.createdAt || '').toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  In Pipeline for 12 days
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
