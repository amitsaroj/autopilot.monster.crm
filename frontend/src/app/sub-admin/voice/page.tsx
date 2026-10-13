'use client';

import { useEffect, useState } from 'react';
import { Phone, Plus, Loader2, Hash, Globe, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminVoiceService } from '@/services/sub-admin-voice.service';

interface VoiceNumber {
  id: string;
  phoneNumber?: string;
  country?: string;
  status?: string;
  [k: string]: unknown;
}

function unwrapList(response: any): VoiceNumber[] {
  const payload = response?.data ?? response;
  const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
  return Array.isArray(list) ? list : [];
}

export default function SubAdminVoicePage() {
  const [numbers, setNumbers] = useState<VoiceNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ phoneNumber: '', country: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminVoiceService.getNumbers();
      setNumbers(unwrapList(res));
    } catch {
      toast.error('Failed to load voice numbers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleProvision = async () => {
    if (!form.phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }
    setSaving(true);
    try {
      await subAdminVoiceService.provisionNumber(form);
      toast.success('Number provisioned');
      setForm({ phoneNumber: '', country: '' });
      setShowForm(false);
      await load();
    } catch {
      toast.error('Failed to provision number');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Voice Numbers</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Workspace Phone Number Inventory
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Provision Number
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Numbers', value: numbers.length, icon: Hash },
          {
            label: 'Active',
            value: numbers.filter((n) => n.status === 'ACTIVE').length,
            icon: CheckCircle2,
          },
          {
            label: 'Countries',
            value: [...new Set(numbers.map((n) => n.country).filter(Boolean))].length,
            icon: Globe,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-blue-500/10">
              <s.icon className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Provision New Number
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Phone number (e.g. +14155550100)"
              value={form.phoneNumber}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              className="p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-gray-600 outline-none focus:border-blue-500/40"
            />
            <input
              type="text"
              placeholder="Country (e.g. US)"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-gray-600 outline-none focus:border-blue-500/40"
            />
          </div>
          <button
            onClick={handleProvision}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
            Provision
          </button>
        </div>
      )}

      {numbers.length === 0 ? (
        <div className="p-16 rounded-2xl bg-card border border-border flex flex-col items-center gap-4 text-center">
          <Phone className="w-12 h-12 text-gray-700" />
          <p className="text-sm font-medium text-muted-foreground">
            No voice numbers have been provisioned for this workspace yet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide hover:underline"
          >
            Provision your first number
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {numbers.map((num) => (
            <div
              key={num.id}
              className="p-6 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Phone className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground font-mono">
                      {num.phoneNumber ?? '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">{num.country ?? 'Unknown region'}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full border text-xs font-semibold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                  {num.status ?? 'ACTIVE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
