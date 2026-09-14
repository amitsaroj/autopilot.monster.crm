'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Bot, MessageSquare, Phone, HardDrive, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminUsageService } from '@/services/sub-admin-usage.service';

interface UsageSummary {
  aiTokens?: number;
  smsCount?: number;
  voiceMinutes?: number;
  storageBytes?: number;
}

function unwrap<T>(response: any): T | null {
  const payload = response?.data ?? response;
  return (payload?.data ?? payload ?? null) as T | null;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function SubAdminUsagePage() {
  const [usage, setUsage] = useState<UsageSummary>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await subAdminUsageService.getUsageSummary();
        setUsage(unwrap<UsageSummary>(res) ?? {});
      } catch {
        toast.error('Failed to load usage summary');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const tiles = [
    {
      label: 'AI Tokens',
      value: (usage.aiTokens ?? 0).toLocaleString(),
      icon: Bot,
    },
    {
      label: 'SMS / WhatsApp Sent',
      value: (usage.smsCount ?? 0).toLocaleString(),
      icon: MessageSquare,
    },
    {
      label: 'Voice Minutes',
      value: (usage.voiceMinutes ?? 0).toLocaleString(),
      icon: Phone,
    },
    {
      label: 'Storage Used',
      value: formatBytes(usage.storageBytes),
      icon: HardDrive,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Usage</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Current Billing Period Consumption
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <t.icon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {t.label}
              </p>
              <p className="text-2xl font-black text-white">{t.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
        <BarChart3 className="w-4 h-4 text-indigo-400" />
        <p className="text-xs text-gray-500">
          Usage is measured against the plan limits configured for this workspace. Contact your
          tenant admin if you're approaching a limit.
        </p>
      </div>
    </div>
  );
}
