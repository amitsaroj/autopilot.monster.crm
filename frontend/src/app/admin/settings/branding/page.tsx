'use client';

import { useEffect, useState } from 'react';
import {
  Upload,
  Palette,
  Globe,
  Shield,
  Layout,
  Camera,
  Save,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { tenantService } from '@/services/tenant.service';

export default function BrandingPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingBranding, setExistingBranding] = useState<Record<string, unknown>>({});
  const [formData, setFormData] = useState({
    companyName: '',
    primaryColor: '#155eef',
    secondaryColor: '#10b981',
    fontFamily: 'Inter, sans-serif',
    logoUrl: '',
    faviconUrl: '',
    customDomain: '',
    whiteLabel: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await tenantService.getSettings();
        const data = response.data.data ?? response.data;
        const branding = data.branding ?? {};
        setExistingBranding(branding);
        setFormData({
          companyName: branding.companyName ?? data.name ?? '',
          primaryColor: branding.primaryColor ?? '#155eef',
          secondaryColor: branding.secondaryColor ?? '#10b981',
          fontFamily: branding.fontFamily ?? 'Inter, sans-serif',
          logoUrl: branding.logoUrl ?? '',
          faviconUrl: branding.faviconUrl ?? '',
          customDomain: data.customDomain ?? branding.customDomain ?? '',
          whiteLabel: branding.whiteLabel ?? false,
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load branding settings');
      } finally {
        setInitialLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await tenantService.updateBranding({
        ...existingBranding,
        companyName: formData.companyName,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        fontFamily: formData.fontFamily,
        logoUrl: formData.logoUrl,
        faviconUrl: formData.faviconUrl,
        customDomain: formData.customDomain,
        whiteLabel: formData.whiteLabel,
      });
      toast.success('Brand identity synchronized successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save branding settings');
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { name: 'Indigo', hex: '#155eef' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Violet', hex: '#168bff' },
  ];

  if (initialLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-6 text-muted-foreground text-sm font-bold uppercase tracking-wide">
        Loading branding settings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-8 rounded-xl border border-border backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Identity Layer Active
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground tracking-tighter uppercase">
            Brand Orchestration
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-bold uppercase tracking-wide">
            Master configuration of tenant visual identity and white-labeling
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-2 group"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
          Synchronize Identity
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-8">
          <div className="p-10 rounded-xl bg-card border border-border shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-10 flex items-center gap-4">
              <Camera className="w-7 h-7 text-blue-500" /> Digital Artifacts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                  Corporate Emblem (Logo URL)
                </label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full bg-card border border-border rounded-[24px] px-8 py-5 text-sm text-blue-700 dark:text-blue-400 font-bold outline-none focus:border-blue-500/40 shadow-inner"
                  placeholder="https://..."
                />
                <div className="aspect-video rounded-xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center group/upload cursor-pointer hover:border-blue-500/20 transition-all">
                  <div className="w-16 h-16 rounded-3xl bg-card flex items-center justify-center text-muted-foreground group-hover/upload:bg-blue-500 group-hover/upload:text-white transition-all shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide group-hover/upload:text-blue-400">
                    Transmit Artifact
                  </p>
                  <p className="text-xs text-gray-700 mt-1 uppercase font-bold">
                    SVG, PNG, Or WEBP (Max 2MB)
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                  Browser Marker (Favicon URL)
                </label>
                <input
                  type="text"
                  value={formData.faviconUrl}
                  onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                  className="w-full bg-card border border-border rounded-[24px] px-8 py-5 text-sm text-blue-700 dark:text-blue-400 font-bold outline-none focus:border-blue-500/40 shadow-inner"
                  placeholder="https://..."
                />
                <div className="aspect-square w-32 rounded-xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center group/upload cursor-pointer hover:border-blue-500/20 transition-all mx-auto md:ml-0">
                  <Layout className="w-7 h-7 text-muted-foreground group-hover/upload:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-xl bg-card border border-border shadow-2xl relative overflow-hidden group">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-10 flex items-center gap-4">
              <Palette className="w-7 h-7 text-emerald-700 dark:text-emerald-400" /> Chromatic Palette
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                  Primary Vector
                </label>
                <div className="flex flex-wrap gap-4">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setFormData({ ...formData, primaryColor: c.hex })}
                      className={`w-14 h-14 rounded-2xl transition-all border-4 shadow-xl ${formData.primaryColor === c.hex ? 'border-white scale-110 shadow-blue-500/20' : 'border-transparent opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                  Manual Override
                </label>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border">
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm tracking-wide uppercase"
                  />
                  <div
                    className="w-8 h-8 rounded-lg shadow-inner"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-xl bg-card border border-border shadow-2xl relative overflow-hidden group">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-10 flex items-center gap-4">
              <Globe className="w-7 h-7 text-sky-500" /> DNS Orchestration
            </h2>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                  Custom Subdomain / Root
                </label>
                <input
                  type="text"
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                  className="w-full bg-card border border-border rounded-[24px] px-8 py-5 text-sm text-blue-700 dark:text-blue-400 font-bold outline-none focus:border-blue-500/40 shadow-inner"
                  placeholder="e.g. login.mycompany.com"
                />
              </div>

              <div className="flex items-center gap-6 p-8 rounded-xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-xl">
                <Shield className="w-10 h-10 text-blue-700 dark:text-blue-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
                    Strict White-Labeling
                  </h4>
                  <p className="text-xs text-muted-foreground font-bold leading-relaxed uppercase tracking-tighter">
                    Remove all "Autopilot Monster" signatures from client-facing portals, emails,
                    and system logs.
                  </p>
                </div>
                <div
                  onClick={() => setFormData({ ...formData, whiteLabel: !formData.whiteLabel })}
                  className={`ml-auto w-16 h-8 rounded-full border border-border p-1 cursor-pointer transition-all ${formData.whiteLabel ? 'bg-blue-600' : 'bg-gray-800'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-xl transition-all ${formData.whiteLabel ? 'translate-x-8' : 'translate-x-0'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
