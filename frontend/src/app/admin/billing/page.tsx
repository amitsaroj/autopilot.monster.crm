"use client";

import { useState, useEffect } from 'react';
import { 
  CreditCard, Zap, ShieldCheck, CheckCircle2, 
  AlertTriangle, ArrowRight, Download, Receipt, 
  Users, Loader2, Globe, TrendingUp, History,
  ExternalLink, BarChart3, Wallet, Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  planId: string;
  status: string;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  billingCycle: string;
}

interface Usage {
  [key: string]: number;
}

export default function RefinedAdminBillingPage() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, usageRes] = await Promise.all([
          fetch('/api/v1/monetization/subscription').then(res => res.ok ? res.json() : null),
          fetch('/api/v1/monetization/usage/all').then(res => res.ok ? res.json() : {})
        ]);
        setSub(subRes);
        setUsage(usageRes);
      } catch (err) {
        toast.error('Failed to synchronize financial artifacts');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePortal = async () => {
    setActionLoading('portal');
    try {
      const res = await fetch('/api/v1/monetization/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to initiate secure portal session');
      }
    } catch (err) {
      toast.error('Encryption bridge failure during portal launch');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Billing Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono">PROVIDER: STRIPE_LATEST</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Financial Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Subscription Lifecycle & Resource Quotas</p>
        </div>
        <button 
           onClick={handlePortal}
           disabled={!!actionLoading}
           className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
           {actionLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
           Manage in Customer Portal
        </button>
      </div>

      {/* Main Billing Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Plan Overview Card */}
         <div className="lg:col-span-2 p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            
            <div className="relative z-10 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Active Workspace Tier</h3>
                     <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        {sub?.planId?.split('-')[0].toUpperCase() || 'FREE'} EDITION
                        <Zap className="w-8 h-8 text-indigo-500 fill-indigo-500/10" />
                     </h2>
                  </div>
                  <div className="text-right space-y-1">
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-3 py-1 rounded-full border border-emerald-400/10 inline-block">
                        {sub?.status || 'Active'}
                     </p>
                     <p className="text-[10px] text-gray-600 font-mono mt-1">NEXT SYNC: {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}</p>
                  </div>
               </div>

               <div className="flex flex-wrap gap-8 py-8 border-y border-white/[0.05]">
                  <div className="space-y-1">
                     <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Billing Cycle</span>
                     <p className="text-sm font-bold text-white uppercase">{sub?.billingCycle || 'Monthly'}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Pricing Point</span>
                     <p className="text-sm font-bold text-white uppercase">Metered Enterprise Core</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Payment Infrastructure</span>
                     <p className="text-sm font-bold text-white flex items-center gap-2">
                        Stripe Secure <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                     </p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button className="px-8 py-4 rounded-2xl bg-white text-[#0b0f19] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                     Modify Workspace Tier
                  </button>
                  <button className="px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all">
                     View Feature Entitlements
                  </button>
               </div>
            </div>
         </div>

         {/* Usage Summary Sticky */}
         <div className="space-y-6">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] space-y-6">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-indigo-400" /> Real-time Quotas
               </h3>
               
               <div className="space-y-6">
                  {[
                    { label: 'CRM Identity Quota', usage: usage['contacts'] || 0, limit: 10000, color: 'bg-indigo-500' },
                    { label: 'AI Execution Time', usage: usage['tasks'] || 0, limit: 1000, color: 'bg-emerald-500' },
                    { label: 'Cloud Persistence', usage: usage['storage'] || 0, limit: 5000, color: 'bg-purple-500' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">{item.label}</span>
                          <span className="text-xs font-black text-white">{item.usage} / {item.limit}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min((item.usage / item.limit) * 100, 100)}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="pt-4 border-t border-white/[0.05]">
                  <p className="text-[10px] text-gray-600 font-medium leading-relaxed italic">
                     * Usage is calculated globally across all team members in this workspace environment.
                  </p>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white space-y-4 shadow-2xl shadow-indigo-500/20">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                     <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-sm uppercase tracking-widest leading-tight">Financial Health</h4>
                     <p className="text-[10px] text-white/60 font-black uppercase tracking-tighter">Automatic Recovery: ON</p>
                  </div>
               </div>
               <p className="text-xs text-white/80 leading-relaxed font-medium">
                  Your payment architecture is currently healthy. All historical invoices are reconciled and verified.
               </p>
            </div>
         </div>
      </div>

      {/* Historical Artifacts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/[0.05] group hover:bg-white/[0.03] transition-all">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-white font-black text-lg flex items-center gap-3 uppercase tracking-tighter">
                  <History className="w-6 h-6 text-indigo-500" /> Transaction Pulse
               </h3>
               <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline transition-all">Full Archives</button>
            </div>
            
            <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/[0.02] group-hover:border-white/5 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-2 rounded-xl bg-white/5 text-gray-500">
                          <Receipt className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-white uppercase tracking-tighter">Invoice Artifact #1029{i}</p>
                          <p className="text-[9px] text-gray-600 font-mono">DATE: APR 0{i}, 2026</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-white">$499.00</p>
                       <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Paid</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/[0.05] flex flex-col justify-between">
            <div className="space-y-4">
               <div className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
                  <Download className="w-6 h-6 text-indigo-500" />
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tight">Tax & Fiscal Artifacts</h4>
                     <p className="text-xs text-gray-500">Generate and download PDF statements for the current fiscal period.</p>
                  </div>
               </div>
               <div className="p-4 rounded-3xl bg-white/[0.05] border border-white/5 flex items-center gap-4">
                  <Globe className="w-6 h-6 text-gray-500" />
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tight">Cross-Border Compliance</h4>
                     <p className="text-xs text-gray-500">Manage VAT/GST tax identification numbers for global entities.</p>
                  </div>
               </div>
            </div>
            
            <div className="p-6 rounded-3xl border border-dashed border-white/10 flex items-center justify-between text-gray-600">
               <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 opacity-50" />
                  <span className="text-xs font-medium uppercase tracking-widest">Next Rebalancing in 12 Days</span>
               </div>
               <ArrowRight className="w-5 h-5 opacity-50" />
            </div>
         </div>

      </div>

    </div>
  );
}
