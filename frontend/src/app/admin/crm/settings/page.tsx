"use client";

import { useState } from 'react';
import {
  Settings, Globe, Bell, Mail, Sliders, Shield,
  Palette, Database, Save, CheckCircle2, Clock,
  Users, Zap, Tag, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'email', label: 'Email Config', icon: Mail },
  { id: 'pipeline', label: 'Pipeline', icon: Sliders },
  { id: 'security', label: 'Data Privacy', icon: Shield },
];

export default function AdminCRMSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    workspaceName: 'My CRM Workspace',
    timezone: 'Asia/Kolkata',
    currency: 'USD',
    language: 'en',
    emailNotifications: true,
    dealAlerts: true,
    leadAssignment: true,
    activityReminders: true,
    emailFromName: 'CRM Team',
    emailFromAddress: 'crm@workspace.com',
    emailSignature: 'Best regards,\nThe CRM Team',
    defaultPipeline: 'Sales Pipeline',
    dealRotting: '14',
    autoClose: false,
    gdprMode: false,
    dataRetention: '24',
    anonymizeDeleted: true,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Settings saved successfully'); }, 1200);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-5">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">General Settings</h2>
            {[
              { label: 'Workspace Name', key: 'workspaceName', type: 'text' },
              { label: 'Default Currency', key: 'currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'INR'] },
              { label: 'Timezone', key: 'timezone', type: 'select', options: ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'UTC'] },
              { label: 'Language', key: 'language', type: 'select', options: ['en', 'es', 'fr', 'de', 'hi'] },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 font-black uppercase tracking-widest block mb-2">{f.label}</label>
                {f.type === 'select' ? (
                  <select value={(settings as any)[f.key]} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 outline-none focus:border-indigo-500/40 transition-all">
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" value={(settings as any)[f.key]} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 outline-none focus:border-indigo-500/40 transition-all placeholder:text-gray-600" />
                )}
              </div>
            ))}
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-5">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Notification Preferences</h2>
            {[
              { label: 'Email Notifications', key: 'emailNotifications', desc: 'Receive email summaries and alerts' },
              { label: 'Deal Stage Alerts', key: 'dealAlerts', desc: 'Alert when deals change stages' },
              { label: 'Lead Assignment Notices', key: 'leadAssignment', desc: 'Notify when leads are assigned' },
              { label: 'Activity Reminders', key: 'activityReminders', desc: 'Daily digest of upcoming activities' },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div>
                  <p className="text-sm font-bold text-white">{f.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
                <button onClick={() => setSettings(s => ({ ...s, [f.key]: !(s as any)[f.key] }))}
                  className={`relative w-12 h-6 rounded-full transition-all ${(settings as any)[f.key] ? 'bg-indigo-500' : 'bg-white/[0.1]'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(settings as any)[f.key] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        );
      case 'email':
        return (
          <div className="space-y-5">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Email Configuration</h2>
            {[
              { label: 'From Name', key: 'emailFromName', type: 'text' },
              { label: 'From Email Address', key: 'emailFromAddress', type: 'email' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 font-black uppercase tracking-widest block mb-2">{f.label}</label>
                <input type={f.type} value={(settings as any)[f.key]} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 outline-none focus:border-indigo-500/40 transition-all" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 font-black uppercase tracking-widest block mb-2">Email Signature</label>
              <textarea rows={4} value={settings.emailSignature} onChange={e => setSettings(s => ({ ...s, emailSignature: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 outline-none focus:border-indigo-500/40 transition-all resize-none" />
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="space-y-5">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Pipeline Configuration</h2>
            <div>
              <label className="text-xs text-gray-400 font-black uppercase tracking-widest block mb-2">Default Pipeline</label>
              <select value={settings.defaultPipeline} onChange={e => setSettings(s => ({ ...s, defaultPipeline: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 outline-none focus:border-indigo-500/40 transition-all">
                <option>Sales Pipeline</option>
                <option>Enterprise Pipeline</option>
                <option>Partner Pipeline</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-black uppercase tracking-widest block mb-2">Deal Rotting Threshold (days)</label>
              <input type="number" value={settings.dealRotting} onChange={e => setSettings(s => ({ ...s, dealRotting: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 outline-none focus:border-indigo-500/40 transition-all" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div>
                <p className="text-sm font-bold text-white">Auto-close stale deals</p>
                <p className="text-xs text-gray-500 mt-0.5">Automatically mark deals as lost after rotting threshold</p>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, autoClose: !s.autoClose }))}
                className={`relative w-12 h-6 rounded-full transition-all ${settings.autoClose ? 'bg-indigo-500' : 'bg-white/[0.1]'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.autoClose ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-5">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Data Privacy</h2>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-400 font-black">GDPR compliance settings affect how contact data is stored and processed.</p>
            </div>
            {[
              { label: 'GDPR Mode', key: 'gdprMode', desc: 'Enable consent tracking on all contacts' },
              { label: 'Anonymize Deleted Contacts', key: 'anonymizeDeleted', desc: 'Replace deleted contact data with anonymized tokens' },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div>
                  <p className="text-sm font-bold text-white">{f.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
                <button onClick={() => setSettings(s => ({ ...s, [f.key]: !(s as any)[f.key] }))}
                  className={`relative w-12 h-6 rounded-full transition-all ${(settings as any)[f.key] ? 'bg-indigo-500' : 'bg-white/[0.1]'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(settings as any)[f.key] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 font-black uppercase tracking-widest block mb-2">Data Retention (months)</label>
              <input type="number" value={settings.dataRetention} onChange={e => setSettings(s => ({ ...s, dataRetention: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 outline-none focus:border-indigo-500/40 transition-all" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">CRM Settings</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Workspace Configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeSection === s.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'}`}>
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            {renderSection()}
            <div className="mt-8 pt-6 border-t border-white/[0.05] flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
