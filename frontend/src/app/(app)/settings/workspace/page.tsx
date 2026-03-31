'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Building2, 
  Globe, 
  Palette, 
  Save, 
  Loader2, 
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layout,
  Type,
  Image as ImageIcon
} from 'lucide-react';
import { tenantService, Tenant } from '@/services/tenant.service';
import toast from 'react-hot-toast';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  customDomain: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const brandingSchema = z.object({
  companyName: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logoUrl: z.string().optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;
type BrandingFormValues = z.infer<typeof brandingSchema>;

export default function WorkspaceSettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'domain'>('general');

  const workspaceForm = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
  });

  const brandingForm = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await tenantService.getSettings();
      const data = response.data.data;
      setTenant(data);
      workspaceForm.reset({
        name: data.name,
        slug: data.slug,
        customDomain: data.customDomain || '',
      });
      brandingForm.reset({
        companyName: data.branding?.companyName || data.name,
        primaryColor: data.branding?.primaryColor || '#4f46e5',
        secondaryColor: data.branding?.secondaryColor || '#10b981',
        logoUrl: data.branding?.logoUrl || '',
      });
    } catch (error) {
      toast.error('Failed to load workspace settings');
    } finally {
      setIsLoading(false);
    }
  };

  const onWorkspaceSubmit = async (data: WorkspaceFormValues) => {
    setIsSaving(true);
    try {
      await tenantService.updateSettings(data);
      toast.success('Workspace settings updated');
      fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const onBrandingSubmit = async (data: BrandingFormValues) => {
    setIsSaving(true);
    try {
      await tenantService.updateBranding(data);
      toast.success('Branding preferences synchronized');
      fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update branding');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 animate-pulse text-muted-foreground uppercase tracking-widest font-black text-xs">Accessing Secure Workspace...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Workspace Settings</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Infrastructure / Identity Management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border/10 pb-1">
        {[
          { id: 'general', label: 'General', icon: Building2 },
          { id: 'branding', label: 'Branding', icon: Palette },
          { id: 'domain', label: 'Infrastructure', icon: Globe },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand animate-in slide-in-from-bottom-1" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'general' && (
            <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="h-6 w-6 text-brand" />
                <h2 className="text-xl font-black tracking-tighter">Identity Configuration</h2>
              </div>
              <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Display Name</label>
                      <input 
                        {...workspaceForm.register('name')}
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/50 outline-none transition-all"
                      />
                      {workspaceForm.formState.errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{workspaceForm.formState.errors.name.message}</p>}
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Subdomain Slug</label>
                      <div className="relative">
                        <input 
                          {...workspaceForm.register('slug')}
                          disabled={isSaving}
                          className="w-full pl-4 pr-16 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/50 outline-none transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase">.crm.ai</div>
                      </div>
                      {workspaceForm.formState.errors.slug && <p className="text-[10px] text-red-500 font-bold uppercase">{workspaceForm.formState.errors.slug.message}</p>}
                   </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button 
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-2.5 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Deploy Updates
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-8">
                <Palette className="h-6 w-6 text-brand" />
                <h2 className="text-xl font-black tracking-tighter">Visual Protocol</h2>
              </div>
              <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <Type className="h-3 w-3" />
                          Branded Name
                        </label>
                        <input 
                          {...brandingForm.register('companyName')}
                          className="w-full px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <ImageIcon className="h-3 w-3" />
                          Logo URL
                        </label>
                        <input 
                          {...brandingForm.register('logoUrl')}
                          className="w-full px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/50 outline-none transition-all"
                          placeholder="https://..."
                        />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand" />
                          Primary Hex Code
                        </label>
                        <div className="flex gap-3">
                           <div className="w-11 h-11 rounded-xl border border-border/50" style={{ backgroundColor: brandingForm.watch('primaryColor') }} />
                           <input 
                             {...brandingForm.register('primaryColor')}
                             className="flex-1 px-4 py-2 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/50 outline-none transition-all"
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          Accent Hex Code
                        </label>
                        <div className="flex gap-3">
                           <div className="w-11 h-11 rounded-xl border border-border/50" style={{ backgroundColor: brandingForm.watch('secondaryColor') }} />
                           <input 
                             {...brandingForm.register('secondaryColor')}
                             className="flex-1 px-4 py-2 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/50 outline-none transition-all"
                           />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-2.5 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm"
                  >
                    Sync Styles
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'domain' && (
             <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-8">
                <Globe className="h-6 w-6 text-brand" />
                <h2 className="text-xl font-black tracking-tighter">Infrastructure & Domains</h2>
              </div>
              <div className="space-y-8">
                 <div className="p-6 rounded-2xl bg-muted/10 border border-border/20 border-l-4 border-l-brand">
                    <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                       <Zap className="h-3.5 w-3.5 text-brand" />
                       White Label Active
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                       Point your CNAME records to <code className="text-brand font-black">proxy.monster.fm</code> to enable custom domain resolution for your CRM instance.
                    </p>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Fully Qualified Domain</label>
                    <div className="flex gap-3">
                       <input 
                         className="flex-1 px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/50 outline-none transition-all"
                         placeholder="crm.yourdomain.com"
                         value={tenant?.customDomain || ''}
                         onChange={(e) => setTenant(tenant ? { ...tenant, customDomain: e.target.value } : null)}
                       />
                       <button className="px-6 py-2.5 bg-muted/50 border border-border/50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all">
                          Verify CNAME
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-xl border border-border/20 bg-card/10">
                       <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">SSL Certificate</p>
                       <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                          <CheckCircle2 className="h-3 w-3" />
                          Validated & Secure
                       </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border/20 bg-card/10">
                       <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">DNS Propagation</p>
                       <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                          <CheckCircle2 className="h-3 w-3" />
                          100% Global
                       </div>
                    </div>
                 </div>
              </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-1">
           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl border-l-4 border-l-brand relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-all" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Layout className="h-4 w-4 text-brand" />
                 Platform Preview
              </h3>
              <div className="space-y-8">
                 <div className="p-4 rounded-xl border border-border/10 bg-background/50 border-t-4" style={{ borderTopColor: brandingForm.watch('primaryColor') }}>
                    <div className="flex items-center gap-2 mb-4">
                       <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center overflow-hidden">
                          {brandingForm.watch('logoUrl') ? (
                            <img src={brandingForm.watch('logoUrl')} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="h-3 w-3" />
                          )}
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[120px]">{brandingForm.watch('companyName')}</p>
                    </div>
                    <div className="h-2 w-full bg-muted/30 rounded-full mb-2" />
                    <div className="h-2 w-2/3 bg-muted/30 rounded-full mb-6" />
                    <div className="h-8 w-full rounded-lg bg-current opacity-80" style={{ color: brandingForm.watch('primaryColor') }} />
                 </div>

                 <p className="text-[10px] text-muted-foreground leading-relaxed font-medium uppercase tracking-wider text-center px-4">
                    Changes to branding are propagated across all tenant-facing surfaces in real-time.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
