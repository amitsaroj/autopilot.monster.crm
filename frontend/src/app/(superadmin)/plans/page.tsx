"use client";

import { useState, useEffect } from 'react';
import { 
  CreditCard, Zap, ShieldCheck, Plus, Pencil, Trash2, 
  Check, X, Globe, DollarSign, Layout, Layers, Loader2,
  ArrowRight, Info, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  isPublic: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/v1/admin/plans');
        const json = await res.json();
        if (json.data) setPlans(json.data);
      } catch (e) {
        toast.error('Failed to sync pricing data');
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Monetization Registry</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Billing Architecture ({plans.length} tiers)</p>
        </div>
        <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Define New Tier
        </button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all relative overflow-hidden flex flex-col justify-between">
             
             {/* Background Decoration */}
             <div className="absolute -right-20 -top-20 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

             <div>
                <div className="flex justify-between items-start mb-6">
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h3 className="text-xl font-black text-white">{plan.name}</h3>
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${plan.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                            {plan.status}
                         </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">ID: {plan.id}</p>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white transition-all">
                         <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/[0.05] border border-white/10 text-gray-400 hover:text-red-400 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-md">
                   {plan.description || 'No detailed tier description provided. Enterprise settings active.'}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                   <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1">
                      <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Monthly Price</span>
                      <p className="text-xl font-black text-white flex items-center gap-1">
                         <span className="text-xs text-gray-500">{plan.currency}</span> {plan.priceMonthly}
                      </p>
                   </div>
                   <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1">
                      <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Annual Price</span>
                      <p className="text-xl font-black text-white flex items-center gap-1">
                         <span className="text-xs text-gray-500">{plan.currency}</span> {plan.priceAnnual}
                      </p>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Visibility</span>
                      <span className={`font-bold ${plan.isPublic ? 'text-indigo-400' : 'text-amber-400'}`}>
                         {plan.isPublic ? 'Public Facing' : 'Invitation Only'}
                      </span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Stripe Sync</span>
                      <span className="font-mono text-[10px] text-gray-400 truncate max-w-[150px]">
                         {plan.stripePriceIdMonthly || 'No Link'}
                      </span>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button className="flex-1 py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Layers className="w-4 h-4" /> Configure Limits
                   </button>
                   <button className="flex-1 py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Manage Features
                   </button>
                </div>
             </div>
          </div>
        ))}

        {/* Create Card */}
        <button className="group p-8 rounded-3xl border border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] transition-all flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all duration-500">
              <Plus className="w-8 h-8 text-gray-600 group-hover:text-indigo-400" />
           </div>
           <div>
              <h3 className="text-lg font-black text-white">Advanced Product Mapping</h3>
              <p className="text-sm text-gray-500 px-10">
                 Provision a custom enterprise-grade tier with specific resource quotas and white-labeling capabilities.
              </p>
           </div>
           <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              Launch Provisioner <ArrowRight className="w-4 h-4" />
           </div>
        </button>
      </div>

      {/* Global Billing Notice */}
      <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
             <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
             <h4 className="text-sm font-bold text-white">Platform Billing Synchronization</h4>
             <p className="text-xs text-gray-500 leading-relaxed">
                Changes to these pricing tiers must be manually synchronized with your Stripe Dashboard. Deleting a plan will NOT cancel existing subscriptions but will prevent new registrations for that tier. Always archive plans before deletion to maintain audit integrity.
             </p>
          </div>
      </div>

    </div>
  );
}
