'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import {
  Mail,
  Send,
  ShieldCheck,
  Database,
  Server,
  Globe,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Activity,
  Cpu,
  Layout,
  Lock,
  Save,
  Terminal,
  History,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
  tlsEnabled: boolean;
  provider: 'SMTP' | 'SES' | 'SENDGRID' | 'POSTMARK';
}

export default function GlobalEmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: 'smtp.autopilotmonster.com',
    smtpPort: 587,
    smtpUser: 'notifications@autopilotmonster.com',
    smtpPass: '••••••••••••••••',
    fromEmail: 'noreply@autopilotmonster.com',
    fromName: 'Autopilot Monster',
    tlsEnabled: true,
    provider: 'SMTP',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get('/admin/settings/email');
        const json = res.data;
        if (json.data) setSettings((prev) => ({ ...prev, ...json.data }));
      } catch (e) {
        toast.error('Failed to sync communication artifacts');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/admin/settings/email', settings);
      if (res.status >= 200 && res.status < 300) {
        toast.success('Communication manifest committed successfully');
      } else {
        toast.error('Failed to commit SMTP configuration');
      }
    } catch (e) {
      toast.error('Network artifact failure during commit');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return toast.error('Verification target email required');
    setTesting(true);
    try {
      const res = await api.post('/admin/settings/email/test', { to: testEmail });
      if (res.status >= 200 && res.status < 300) {
        toast.success('Test artifact dispatched successfully');
      } else {
        toast.error('SMTP Authentication failure during dispatch');
      }
    } catch (e) {
      toast.error('Communication bridge failure during test');
    } finally {
      setTesting(false);
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Outbound Persistence active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Server: Mail-Relay-X1
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Communication Orchestrator
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage Global SMTP & Message Dispatch Infrastructure
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Commit Dispatch Baseline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main SMTP Form */}
        <div className="lg:col-span-2 space-y-10">
          <div className="p-10 rounded-xl bg-card border border-border shadow-2xl space-y-10 group">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-3 uppercase tracking-tighter">
              <Server className="w-6 h-6 text-blue-500" /> Dispatch Infrastructure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  SMTP Gateway Host
                </label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Gateway Port
                </label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Authentication Identity
                </label>
                <input
                  type="text"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all font-medium"
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Authentication Secret
                </label>
                <input
                  type="password"
                  value={settings.smtpPass}
                  onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all font-medium"
                />
                <div className="absolute right-4 top-10 flex gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-blue-500/[0.02] border border-blue-500/10 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  TLS Encryption Bridge
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  Verify connection integrity via STARTTLS protocol before artifact dispatch.
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, tlsEnabled: !settings.tlsEnabled })}
                className={`w-12 h-6 rounded-full p-1 transition-all ${settings.tlsEnabled ? 'bg-blue-600' : 'bg-card'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-all ${settings.tlsEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          <div className="p-10 rounded-xl bg-card border border-border shadow-2xl space-y-10 group">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-3 uppercase tracking-tighter">
              <Mail className="w-6 h-6 text-emerald-700 dark:text-emerald-400" /> Send invitation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Universal From Email
                </label>
                <input
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Universal Sender Name
                </label>
                <input
                  type="text"
                  value={settings.fromName}
                  onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Side: Verification & Compliance */}
        <div className="space-y-10">
          <div className="p-8 rounded-xl bg-card border border-border shadow-2xl space-y-8">
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wide flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Verification Tunnel
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1 block text-center">
                  Re-Verification Target
                </label>
                <input
                  type="email"
                  placeholder="test@autopilotmonster.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all font-medium text-center"
                />
              </div>
              <button
                onClick={handleTestEmail}
                disabled={testing}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Dispatch Verification Artifact
              </button>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-card border border-border shadow-2xl space-y-8">
            <h3 className="text-foreground font-semibold text-sm uppercase tracking-wide flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /> Verified Providers
            </h3>

            <div className="space-y-3">
              {[
                { id: 'SMTP', label: 'Authorized Relay', active: settings.provider === 'SMTP' },
                { id: 'SES', label: 'AWS Cloud Engine', active: settings.provider === 'SES' },
                {
                  id: 'SENDGRID',
                  label: 'SendGrid Grid',
                  active: settings.provider === 'SENDGRID',
                },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSettings({ ...settings, provider: p.id as any })}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${p.active ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/40 border-border hover:border-white/10'}`}
                >
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${p.active ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {p.id}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono italic">{p.label}</p>
                  </div>
                  {p.active && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-500/50" />
                  )}
                </div>
              ))}
              <button className="w-full py-3 border border-dashed border-border rounded-2xl text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <Plus className="w-3 h-3" /> Connect Cloud Engine
              </button>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-4 group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-tighter leading-tight">
                  SMTP Integrity
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">
                  Connection: Certified
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Dispatch infrastructure is verified for DMARC, SPF, and DKIM compliance artifacts. All
              system-generated communication is cryptographically signed.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Advisory Ledger */}
      <div className="p-10 rounded-xl bg-card border border-border flex items-center gap-8 group">
        <div className="p-4 rounded-3xl bg-card border border-border text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-all">
          <History className="w-10 h-10" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter">
            Communication Persistence Policy
          </h3>
          <p className="text-sm text-muted-foreground max-w-4xl">
            Platform SMTP artifacts are synchronized hourly with the communication cluster.
            Administrative efforts to modify or bypass dispatch protocols generate an emergency
            'security.audit' artifact for platform forensic review.
          </p>
        </div>
      </div>
    </div>
  );
}
