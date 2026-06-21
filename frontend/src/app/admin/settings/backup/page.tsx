"use client";

import { useState, useEffect } from 'react';
import {
  Save, Loader2, ShieldCheck, HardDrive, Activity, Cloud, Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseApiData } from '@/lib/api/parse-response';
import { adminBackupsService } from '@/services/admin-backups.service';

interface BackupRecord {
  id: string;
  name?: string;
  size?: string | number;
  type?: string;
  status?: string;
  createdAt: string;
}

export default function WorkspaceDataManagementPage() {
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [backups, setBackups] = useState<BackupRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminBackupsService.findAll();
        const payload = parseApiData<BackupRecord[]>(res) ?? res?.data ?? [];
        setBackups(Array.isArray(payload) ? payload : []);
      } catch {
        toast.error('Failed to load backup records');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleExport = async (type: string) => {
    setTriggering(true);
    try {
      const res = await fetch(`/api/v1/crm/export/${type}`);
      const json = await res.json();
      if (json.data) {
        const blob = new Blob([json.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autopilot_monster_export_${type}_${Date.now()}.csv`;
        a.click();
        toast.success('Data artifact exported successfully');
      }
    } catch {
      toast.error('Failed to initialize export dispatch');
    } finally {
      setTriggering(false);
    }
  };

  const handleTriggerBackup = async () => {
    setTriggering(true);
    try {
      await adminBackupsService.trigger();
      const res = await adminBackupsService.findAll();
      const payload = parseApiData<BackupRecord[]>(res) ?? res?.data ?? [];
      setBackups(Array.isArray(payload) ? payload : []);
      toast.success('Backup snapshot initiated');
    } catch {
      toast.error('Failed to trigger backup');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              Persistence Protocol Active
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Data Integrity forensics</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Manage Backups, Data Portability & Persistence Lattices
          </p>
        </div>
        <button
          type="button"
          disabled={triggering}
          onClick={() => void handleTriggerBackup()}
          className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Provision Snapshot Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Integrity Pulse', value: '100%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Stored Snapshots', value: String(backups.length), icon: HardDrive, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Recovery Latency', value: '1.2s', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Cloud Synchronicity', value: 'Active', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-8 h-8" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <div className="px-8 py-6 border-b border-white/[0.05] flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Backup Artifacts</h2>
          <div className="flex gap-3">
            <button type="button" onClick={() => void handleExport('contacts')} className="px-4 py-2 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 flex items-center gap-2">
              <Download className="w-3 h-3" /> Export Contacts
            </button>
            <button type="button" onClick={() => void handleExport('deals')} className="px-4 py-2 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 flex items-center gap-2">
              <Download className="w-3 h-3" /> Export Deals
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {backups.map((backup) => (
            <div key={backup.id} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.02]">
              <div>
                <p className="text-sm font-bold text-white">{backup.name ?? backup.type ?? backup.id}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  {new Date(backup.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{backup.status ?? 'READY'}</p>
                {backup.size !== undefined && (
                  <p className="text-[10px] text-gray-500 mt-1">{String(backup.size)}</p>
                )}
              </div>
            </div>
          ))}
          {backups.length === 0 && (
            <div className="px-8 py-12 text-center text-gray-500 text-sm">No backup artifacts yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
