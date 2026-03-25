'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { adminSubscriptionsService } from '@/services/admin-subscriptions.service';

export default function SuperAdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await adminSubscriptionsService.findAll();
      setSubscriptions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubs = subscriptions.filter(sub => 
    sub.tenantId.toLowerCase().includes(search.toLowerCase()) ||
    sub.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Subscription Control</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Tenant Lifecycle / Recurring Revenue</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl flex items-center gap-3 shadow-lg shadow-brand/5">
              <TrendingUp className="h-4 w-4 text-brand" />
              <span className="text-sm font-black text-brand tracking-tight">$42,850 MRR</span>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search by tenant or status..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">{filteredSubs.length} Active Contracts</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted/20 border border-border/20 animate-pulse" />
          ))
        ) : filteredSubs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card/10 rounded-2xl border border-dashed border-border/50">
             <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-10" />
             <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Active Subscriptions Found</p>
          </div>
        ) : (
          filteredSubs.map((sub) => (
            <div key={sub.id} className="group p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md hover:border-brand/30 transition-all cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <div className={cn("w-2 h-2 rounded-full",
                   sub.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                 )} />
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-all">
                    <Zap className="h-6 w-6 text-brand" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black tracking-tighter uppercase group-hover:text-brand transition-colors">{sub.tenantId.slice(0, 8)}</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{sub.status}</p>
                 </div>
              </div>

              <div className="space-y-3 mb-6">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-muted-foreground/60">Current Period</span>
                    <span className="tracking-tight">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-muted-foreground/60">Billing Cycle</span>
                    <span className="px-2 py-0.5 bg-muted rounded-md text-[10px]">{sub.billingCycle}</span>
                 </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border/10">
                 <button className="flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-border/50 rounded-lg hover:bg-muted transition-all">
                    Manage Tier
                 </button>
                 <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
