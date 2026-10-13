'use client';

import { useEffect, useState, use } from 'react';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Zap,
  Play,
  Pause,
  Clock,
  Settings,
  MoreVertical,
  Activity,
  Target,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  campaignService,
  Campaign,
  CampaignStatus,
  CampaignType,
} from '@/services/campaign.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Campaign>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await campaignService.getCampaign(id);
      const data = (res as any).data.data;
      setCampaign(data);
      setFormData(data);
    } catch (error) {
      toast.error('Failed to load campaign');
      router.push('/crm/campaigns');
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
      await campaignService.updateCampaign(id, formData);
      toast.success('Campaign updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status: CampaignStatus) => {
    try {
      await campaignService.updateCampaign(id, { status });
      toast.success(`Campaign ${status.toLowerCase()}`);
      fetchData();
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const progress = campaign
    ? campaign.totalLeads > 0
      ? (campaign.completedLeads / campaign.totalLeads) * 100
      : 0
    : 0;
  const conversionRate = campaign
    ? campaign.completedLeads > 0
      ? (campaign.qualifiedLeads / campaign.completedLeads) * 100
      : 0
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/crm/campaigns"
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>
        <div className="flex items-center gap-3">
          {campaign?.status === CampaignStatus.PAUSED ||
          campaign?.status === CampaignStatus.DRAFT ? (
            <button
              onClick={() => handleStatusChange(CampaignStatus.RUNNING)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4" />
              Resume Campaign
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange(CampaignStatus.PAUSED)}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-foreground rounded-xl font-bold text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Pause className="w-4 h-4" />
              Pause Campaign
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-soft p-10 lg:p-14">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                <Target className="w-16 h-16" />
              </div>
              <div className="flex-1 pt-2">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {formData.name}
                  </h1>
                  <span
                    className={cn(
                      'px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest',
                      campaign?.status === CampaignStatus.RUNNING
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-gray-50 text-muted-foreground border-gray-100',
                    )}
                  >
                    {campaign?.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Channel
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                      {campaign?.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Budget
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      ${campaign?.budget || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Spent
                    </p>
                    <p className="text-sm font-bold text-blue-600">
                      ${campaign?.spent || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-soft p-8 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Conversion Rate
              </p>
              <h2 className="text-4xl font-semibold text-gray-900 dark:text-white">
                {conversionRate.toFixed(1)}%
              </h2>
            </div>
            <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-soft p-8 text-center">
              <Activity className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Outreach Progress
              </p>
              <h2 className="text-4xl font-semibold text-gray-900 dark:text-white">
                {progress.toFixed(0)}%
              </h2>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-soft p-10">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
              Performance Metrics
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">Total Leads</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {campaign?.totalLeads}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                <span className="text-sm font-bold text-muted-foreground">Qualified Conversions</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {campaign?.qualifiedLeads}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">Unqualified/Failed</span>
                <span className="text-sm font-semibold text-red-500">
                  {campaign ? campaign.completedLeads - campaign.qualifiedLeads : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-soft p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white mb-6">
              Campaign Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                  Channel Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none font-bold text-sm"
                >
                  {Object.values(CampaignType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-soft p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white mb-6">
              Linked AI Agent
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Sarah (Sales Expert)
                </p>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Active Outbound Mode</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Delete campaign?')) router.push('/crm/campaigns');
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-semibold text-xs uppercase tracking-wide transition"
          >
            <Trash2 className="w-4 h-4" />
            Archive Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
