'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  Settings, 
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Info
} from 'lucide-react';
import { adminTenantsService } from '@/services/admin-tenants.service';

export default function TenantDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [overrides, setOverrides] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantRes, overridesRes] = await Promise.all([
        adminTenantsService.findOne(id as string),
        adminTenantsService.getOverrides(id as string)
      ]);
      setTenant(tenantRes.data);
      setOverrides(overridesRes.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverrides = async () => {
    try {
      setSaving(true);
      await adminTenantsService.updateOverrides(id as string, overrides);
      // Success toast or notification
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOverrides = async () => {
    if (!confirm('Are you sure you want to remove all overrides for this tenant?')) return;
    try {
      setSaving(true);
      await adminTenantsService.removeOverrides(id as string);
      setOverrides({});
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-muted-foreground uppercase tracking-widest font-black text-xs">Initializing Secure Connection...</div>;
  if (!tenant) return <div className="p-8 text-red-500 font-bold">Tenant not found</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div className="flex items-center gap-4">
           <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-muted/50 border border-border/30 transition-all group"
           >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <h1 className="page-title font-black text-3xl tracking-tighter">{tenant.name}</h1>
              <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Tenant ID: {tenant.id}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={handleRemoveOverrides}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-all font-bold text-sm"
           >
              <Trash2 className="h-4 w-4" />
              Reset Overrides
           </button>
           <button 
            onClick={handleSaveOverrides}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all font-bold shadow-lg shadow-brand/20 text-sm"
           >
              <Save className="h-4 w-4" />
              {saving ? 'Syncing...' : 'Save Configuration'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Metadata */}
        <div className="lg:col-span-1 space-y-6">
           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Building2 className="h-4 w-4 text-brand" />
                 Tenant Metadata
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Slug', value: tenant.slug },
                   { label: 'Status', value: tenant.status, color: tenant.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500' },
                   { label: 'Current Plan', value: tenant.planId || 'Free' },
                   { label: 'Created At', value: new Date(tenant.createdAt).toLocaleDateString() },
                 ].map((item) => (
                   <div key={item.label}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">{item.label}</p>
                      <p className={`text-sm font-bold tracking-tight ${item.color || 'text-foreground'}`}>{item.value}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-6 shadow-xl border-l-4 border-l-brand">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info className="h-4 w-4 text-brand" />
                 Override Protocol
              </h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                 Manual overrides take precedence over Plan restrictions. Use this to grant specific features or increase limits for high-value accounts without changing their base plan.
              </p>
           </div>
        </div>

        {/* Right: Overrides Management */}
        <div className="lg:col-span-2 space-y-8">
           {/* Features Overrides */}
           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
                    <Zap className="h-6 w-6 text-brand" />
                    Feature Overrides
                 </h2>
                 <button className="text-[10px] border border-border/50 px-3 py-1 rounded-full font-black uppercase tracking-widest hover:border-brand/40 hover:text-brand transition-all">
                    Add Explicit Rule
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {['ai_chat', 'custom_domain', 'white_label', 'api_access', 'audit_logs'].map((feature) => (
                    <div key={feature} className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-muted/10 group hover:border-brand/20 transition-all">
                       <div>
                          <p className="text-sm font-bold uppercase tracking-tighter group-hover:text-brand transition-colors">{feature.replace('_', ' ')}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Explicitly enabled for this tenant</p>
                       </div>
                       <div className="flex items-center h-6">
                          <input 
                            type="checkbox" 
                            className="w-10 h-5 bg-muted/50 checked:bg-brand appearance-none rounded-full border border-border/50 relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-5 before:transition-all"
                            checked={overrides.features?.[feature] === true}
                            onChange={(e) => {
                               const newFeatures = { ...overrides.features, [feature]: e.target.checked };
                               setOverrides({ ...overrides, features: newFeatures });
                            }}
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Limits Overrides */}
           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-brand" />
                    Resource Limits
                 </h2>
              </div>

              <div className="space-y-6">
                 {['max_users', 'max_contacts', 'max_storage_gb', 'max_api_requests'].map((limit) => (
                    <div key={limit} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/20 bg-muted/10">
                       <div>
                          <p className="text-sm font-bold uppercase tracking-tighter">{limit.replace('_', ' ')}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Set explicit resource quota</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            className="w-32 px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-black focus:border-brand/40 transition-all outline-none"
                            placeholder="Plan Default"
                            value={overrides.limits?.[limit] || ''}
                            onChange={(e) => {
                               const newLimits = { ...overrides.limits, [limit]: parseInt(e.target.value) || undefined };
                               setOverrides({ ...overrides, limits: newLimits });
                            }}
                          />
                          <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Units</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
