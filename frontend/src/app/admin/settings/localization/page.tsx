'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  DollarSign,
  Languages,
  Save,
  RefreshCw,
  MapPin,
  Calendar,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { tenantService } from '@/services/tenant.service';

interface LocalizationSettings {
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
}

export default function LocalizationPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingBranding, setExistingBranding] = useState<Record<string, unknown>>({});
  const [settings, setSettings] = useState<LocalizationSettings>({
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await tenantService.getSettings();
        const data = response.data.data ?? response.data;
        const branding = data.branding ?? {};
        setExistingBranding(branding);
        const localization = branding.localization ?? {};
        setSettings({
          language: localization.language ?? 'en',
          timezone: localization.timezone ?? 'UTC',
          currency: localization.currency ?? 'USD',
          dateFormat: localization.dateFormat ?? 'MM/DD/YYYY',
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load localization settings');
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
        localization: settings,
      });
      toast.success('Global locale synchronized successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save localization settings');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-6 text-muted-foreground text-sm font-bold uppercase tracking-wide">
        Loading localization settings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-8 rounded-xl border border-border backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Locale Layer Active
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground tracking-tighter uppercase">
            Locale Orchestration
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-bold uppercase tracking-wide">
            Configure global system language, temporal zones, and fiscal currency
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-2 group"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 group-hover:scale-110 transition-all" />
          )}
          Save Configurations
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 rounded-xl bg-card border border-border shadow-2xl relative overflow-hidden group">
          <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-10 flex items-center gap-4">
            <Languages className="w-7 h-7 text-blue-500" /> Dialect & Time
          </h2>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                System Primary Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-card border border-border rounded-[24px] px-8 py-5 text-sm text-blue-700 dark:text-blue-400 font-bold outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
              >
                <option value="en" className="bg-card">
                  English (Global Standard)
                </option>
                <option value="es" className="bg-card">
                  Español (Standard)
                </option>
                <option value="fr" className="bg-card">
                  Français (European)
                </option>
                <option value="de" className="bg-card">
                  Deutsch (DACH)
                </option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                Temporal Zone (Timezone)
              </label>
              <div className="relative">
                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full bg-card border border-border rounded-[24px] pl-16 pr-8 py-5 text-sm text-blue-700 dark:text-blue-400 font-bold outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                >
                  <option value="UTC" className="bg-card">
                    Coordinated Universal Time (UTC)
                  </option>
                  <option value="EST" className="bg-card">
                    Eastern Standard Time (EST)
                  </option>
                  <option value="PST" className="bg-card">
                    Pacific Standard Time (PST)
                  </option>
                  <option value="IST" className="bg-card">
                    Indian Standard Time (IST)
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 rounded-xl bg-card border border-border shadow-2xl relative overflow-hidden group">
          <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-10 flex items-center gap-4">
            <DollarSign className="w-7 h-7 text-emerald-700 dark:text-emerald-400" /> Fiscal &
            Formats
          </h2>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                Primary Fiscal Unit (Currency)
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full bg-card border border-border rounded-[24px] px-8 py-5 text-sm text-emerald-700 dark:text-emerald-400 font-bold outline-none focus:border-emerald-500/40 appearance-none cursor-pointer"
              >
                <option value="USD" className="bg-card">
                  US Dollar ($)
                </option>
                <option value="EUR" className="bg-card">
                  Euro (€)
                </option>
                <option value="GBP" className="bg-card">
                  British Pound (£)
                </option>
                <option value="INR" className="bg-card">
                  Indian Rupee (₹)
                </option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2">
                Date Notation Format
              </label>
              <div className="relative">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full bg-card border border-border rounded-[24px] pl-16 pr-8 py-5 text-sm text-emerald-700 dark:text-emerald-400 font-bold outline-none focus:border-emerald-500/40 appearance-none cursor-pointer"
                >
                  <option value="MM/DD/YYYY" className="bg-card">
                    MM/DD/YYYY (USA)
                  </option>
                  <option value="DD/MM/YYYY" className="bg-card">
                    DD/MM/YYYY (Global)
                  </option>
                  <option value="YYYY-MM-DD" className="bg-card">
                    YYYY-MM-DD (ISO)
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 p-10 rounded-xl bg-card border border-border flex items-center gap-10">
          <div className="w-20 h-20 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400">
            <MapPin className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-foreground uppercase tracking-tight mb-1">
              Enforce Regional Compliance
            </h4>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide max-w-2xl leading-relaxed">
              System-wide enforcement of local tax laws, currency symbols, and data residency
              protocols based on tenant headquarters.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Compliance Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
