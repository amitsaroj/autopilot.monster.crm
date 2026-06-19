"use client";

import { useState, useEffect } from 'react';
import { Phone, Plus, Search, CheckCircle2, XCircle, RefreshCw, Settings, Globe, Hash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { voicePhoneNumberService, type VoicePhoneNumber } from '@/services/voice-phone-number.service';

const TYPE_STYLES: Record<string, string> = {
  LOCAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  TOLL_FREE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MOBILE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminVoiceNumbersPage() {
  const [numbers, setNumbers] = useState<VoicePhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await voicePhoneNumberService.list();
        setNumbers(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load phone numbers');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = numbers.filter(n =>
    n.phoneNumber.includes(search) ||
    n.country.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-black text-white tracking-tight">Voice Numbers</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Phone Number Inventory</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Buy Number
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Numbers', value: numbers.length, icon: Hash },
          { label: 'Active', value: numbers.filter(n => n.status === 'ACTIVE').length, icon: CheckCircle2 },
          { label: 'Countries', value: [...new Set(numbers.map(n => n.country))].length, icon: Globe },
          { label: 'Provisioned', value: numbers.length, icon: Phone },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10"><s.icon className="w-5 h-5 text-indigo-400" /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search by number, name, or country..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(num => (
          <div key={num.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all">
                  <Phone className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-base font-black text-white font-mono">{num.phoneNumber}</p>
                  <p className="text-xs text-gray-500">{num.twilioSid ?? 'Twilio'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${STATUS_STYLES[num.status]}`}>{num.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Country</p>
                <p className="text-sm font-black text-white">{num.country}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Capabilities</p>
                <p className="text-xs font-black text-white truncate">
                  {[
                    num.capabilities.voice && 'Voice',
                    num.capabilities.sms && 'SMS',
                    num.capabilities.mms && 'MMS',
                  ].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {Object.entries(num.capabilities).filter(([, v]) => v).map(([cap]) => (
                <span key={cap} className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400 font-black uppercase tracking-widest">{cap}</span>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-indigo-400" /> Configure Number
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
