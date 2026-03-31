'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Settings, 
  Zap, 
  ShieldCheck, 
  Trash2, 
  Edit3,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { adminPlansService } from '@/services/admin-plans.service';

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await adminPlansService.findAll();
      setPlans(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Subscription Plans</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Monetization Engine / Global Tiers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm">
            <Plus className="h-4 w-4" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-96 rounded-2xl bg-muted/20 border border-border/20 animate-pulse" />
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card/10 rounded-2xl border border-dashed border-border/50">
             <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-10" />
             <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Active Plans Defined</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="group relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md p-8 shadow-xl hover:border-brand/30 transition-all">
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-black tracking-tighter group-hover:text-brand transition-colors">{plan.name}</h3>
                   <p className="text-xs text-muted-foreground font-medium">{plan.description}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-brand">
                   <Zap className="h-5 w-5" />
                </div>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black tracking-tighter">${plan.price}</span>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest ml-2">/ month</span>
              </div>

              <div className="space-y-4 mb-8">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Features & Quotas</p>
                 {/* Logic for features/limits display */}
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                       <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                       Unlimited Contacts
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                       <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                       AI Copilot Access
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                       <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                       Advanced Analytics
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2 pt-6 border-t border-border/10">
                 <button className="flex-1 px-4 py-2 text-xs font-black uppercase tracking-widest border border-border/50 rounded-lg hover:bg-muted transition-all">
                    Edit Tier
                 </button>
                 <button className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20">
                    <Trash2 className="h-4 w-4" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Features & Limits Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
                  <Settings className="h-6 w-6 text-brand" />
                  Global Feature Flags
               </h2>
               <Link href="/superadmin/features" className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">Manage All</Link>
            </div>
            <div className="space-y-4">
               {['AI Agent', 'Voice Integration', 'WhatsApp API', 'White Labeling'].map(feature => (
                 <div key={feature} className="flex justify-between items-center p-3 rounded-xl border border-border/10">
                    <span className="text-sm font-bold tracking-tight">{feature}</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-md">Enabled</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-brand" />
                  System Resource Limits
               </h2>
               <Link href="/superadmin/limits" className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">Manage All</Link>
            </div>
            <div className="space-y-4">
               {[
                 { label: 'Max Attachments', value: '100MB' },
                 { label: 'Max API Requests', value: '10k/day' },
                 { label: 'Storage Retention', value: '30 Days' },
                 { label: 'Max Conc. Calls', value: '5' },
               ].map(limit => (
                 <div key={limit.label} className="flex justify-between items-center p-3 rounded-xl border border-border/10">
                    <span className="text-sm font-bold tracking-tight">{limit.label}</span>
                    <span className="text-xs font-black text-brand">{limit.value}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} className={className}>{children}</a>;
}
