import { Lock, Shield, Smartphone, AlertTriangle, LogOut, Save, Check } from 'lucide-react';

const sessions = [
  { device: 'Chrome on macOS', ip: '203.0.113.42', location: 'Bengaluru, IN', last: 'Now', current: true },
  { device: 'Safari on iPhone', ip: '203.0.113.55', location: 'Mumbai, IN', last: '2h ago', current: false },
];

export default function SettingsPasswordPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Password & Security</h1>
        <p className="page-description">Manage your password, 2FA, and active sessions</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-[hsl(246,80%,60%)]" />Change Password</h2>
        {[
          { label: 'Current Password', id: 'cur' },
          { label: 'New Password', id: 'new' },
          { label: 'Confirm New Password', id: 'confirm' },
        ].map((f) => (
          <div key={f.id}>
            <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
            <input type="password" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
        ))}
        <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
          {['8+ characters', 'Uppercase letter', 'Number', 'Special character'].map((r) => (
            <span key={r} className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full"><Check className="h-2.5 w-2.5 text-green-500" />{r}</span>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Save className="h-4 w-4" />Update Password</button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Smartphone className="h-4 w-4 text-[hsl(246,80%,60%)]" />Two-Factor Authentication</h2>
          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full">Disabled</span>
        </div>
        <p className="text-sm text-muted-foreground">Add extra security by requiring a code from your authenticator app when signing in.</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"><Shield className="h-4 w-4" />Enable 2FA</button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[hsl(246,80%,60%)]" />Active Sessions</h2>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.device} className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{s.device}</p>
                  {s.current && <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-xs rounded">Current</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.ip} · {s.location} · {s.last}</p>
              </div>
              {!s.current && <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"><LogOut className="h-3 w-3" />Revoke</button>}
            </div>
          ))}
        </div>
        <button className="text-xs text-red-400 hover:underline">Revoke all other sessions</button>
      </div>
    </div>
  );
}
