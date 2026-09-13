'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Loader2, Link2 } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminWhatsappService } from '@/services/sub-admin-whatsapp.service';

interface WhatsappProfile {
  id: string;
  displayName?: string;
  phoneNumberId?: string;
  status?: string;
  [k: string]: unknown;
}

function unwrapList(response: any): WhatsappProfile[] {
  const payload = response?.data ?? response;
  const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
  return Array.isArray(list) ? list : [];
}

export default function SubAdminWhatsappPage() {
  const [profiles, setProfiles] = useState<WhatsappProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ displayName: '', phoneNumberId: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminWhatsappService.getProfiles();
      setProfiles(unwrapList(res));
    } catch {
      toast.error('Failed to load WhatsApp profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleLink = async () => {
    if (!form.phoneNumberId.trim()) {
      toast.error('Phone number ID is required');
      return;
    }
    setSaving(true);
    try {
      await subAdminWhatsappService.linkProfile(form);
      toast.success('WhatsApp profile linked');
      setForm({ displayName: '', phoneNumberId: '' });
      setShowForm(false);
      await load();
    } catch {
      toast.error('Failed to link profile');
    } finally {
      setSaving(false);
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">WhatsApp Profiles</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Linked Business Profiles
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Link Profile
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: 'Linked Profiles', value: profiles.length, icon: MessageSquare }].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <s.icon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Link WhatsApp Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Display name"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-indigo-500/40"
            />
            <input
              type="text"
              placeholder="Meta phone number ID"
              value={form.phoneNumberId}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumberId: e.target.value }))}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-indigo-500/40"
            />
          </div>
          <button
            onClick={handleLink}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            Link Profile
          </button>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center gap-4 text-center">
          <MessageSquare className="w-12 h-12 text-gray-700" />
          <p className="text-sm font-medium text-gray-500">
            No WhatsApp business profiles are linked to this workspace yet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:underline"
          >
            Link your first profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white">{p.displayName ?? p.id}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {p.phoneNumberId ?? 'No phone number ID'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {p.status ?? 'ACTIVE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
