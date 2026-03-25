"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Users, 
  Phone, 
  Play, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  X
} from 'lucide-react';
import { campaignService, Campaign, CampaignStatus, CampaignType } from '@/services/campaign.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CampaignsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [step, setStep] = useState(1);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: CampaignType.VOICE,
    agentId: '',
  });

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await campaignService.getCampaigns();
      setCampaigns((res as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await campaignService.createCampaign(newCampaign);
      toast.success('Campaign launched');
      setShowUpload(false);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case CampaignStatus.RUNNING: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case CampaignStatus.PAUSED: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case CampaignStatus.COMPLETED: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case CampaignStatus.DRAFT: return 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border-transparent';
      default: return 'bg-gray-100 text-gray-500 border-transparent';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const activeCount = campaigns.filter(c => c.status === CampaignStatus.RUNNING).length;
  const totalLeads = campaigns.reduce((sum, c) => sum + c.totalLeads, 0);
  const totalQualified = campaigns.reduce((sum, c) => sum + c.qualifiedLeads, 0);

  const stats = [
    { label: 'Active Campaigns', value: activeCount.toString(), icon: Play, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: 'Total Leads', value: totalLeads.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Qualified ROI', value: totalQualified.toString(), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: 'AI Saturation', value: '94%', icon: Phone, color: 'text-orange-600', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Marketing Campaigns</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 italic">Optimize your outreach across multiple channels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setShowUpload(true); setStep(1); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-transparent text-left">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qualified</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/crm/campaigns/${c.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border", getStatusColor(c.status as string))}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5 min-w-[120px]">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                        <span>{c.totalLeads > 0 ? Math.round((c.completedLeads / c.totalLeads) * 100) : 0}%</span>
                        <span>{c.completedLeads}/{c.totalLeads}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${c.totalLeads > 0 ? (c.completedLeads / c.totalLeads) * 100 : 0}%` }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-500 dark:text-gray-400">
                    {c.type}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                    {c.qualifiedLeads}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-bold">No campaigns yet. Launch your first outreach!</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUpload(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-white dark:bg-card rounded-3xl shadow-2xl border border-gray-200 dark:border-border overflow-hidden p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold dark:text-white">New Campaign</h2>
                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {step === 1 && (
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Campaign Name</label>
                    <input 
                      type="text" 
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      placeholder="e.g. Q1 Sales Outreach"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Selection Channel</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(CampaignType).map(type => (
                        <button
                          key={type}
                          onClick={() => setNewCampaign({ ...newCampaign, type: type as any })}
                          className={cn(
                            "px-4 py-3 rounded-xl border text-xs font-bold transition",
                            newCampaign.type === type ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-border">
                <button 
                  onClick={handleCreate}
                  disabled={isCreating || !newCampaign.name}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Launch Campaign
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
