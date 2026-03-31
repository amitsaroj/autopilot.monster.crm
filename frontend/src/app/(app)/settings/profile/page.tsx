import { User, Mail, Lock, Bell, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-description">Manage your personal information and preferences</p>
      </div>

      {/* Avatar */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-[hsl(246,80%,60%)] flex items-center justify-center text-2xl font-bold text-white">A</div>
        <div>
          <p className="font-semibold text-foreground">Amit Saroj</p>
          <p className="text-sm text-muted-foreground">autopilot.monster@gmail.com · Super Admin</p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1.5 text-xs bg-[hsl(246,80%,60%)] text-white rounded-lg hover:bg-[hsl(246,80%,55%)] transition-colors">Upload Photo</button>
            <button className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">Remove</button>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-[hsl(246,80%,60%)]" />
          <h2 className="text-sm font-semibold">Personal Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'First Name', value: 'Amit', type: 'text' },
            { label: 'Last Name', value: 'Saroj', type: 'text' },
            { label: 'Job Title', value: 'CRM Administrator', type: 'text' },
            { label: 'Department', value: 'Operations', type: 'text' },
            { label: 'Phone', value: '+91 98765 43210', type: 'tel' },
            { label: 'Timezone', value: 'Asia/Kolkata (IST)', type: 'text' },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs text-muted-foreground font-medium block mb-1">{f.label}</label>
              <input type={f.type} defaultValue={f.value} className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Email</label>
          <input type="email" defaultValue="autopilot.monster@gmail.com" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Bio</label>
          <textarea rows={3} defaultValue="CRM system administrator managing the AutopilotMonster workspace." className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] resize-none" />
        </div>
        <div className="pt-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Save className="h-4 w-4" /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
