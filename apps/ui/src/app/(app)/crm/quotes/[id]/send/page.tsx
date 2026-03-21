import { Send, Mail, Link as LinkIcon, Eye, Download, ArrowLeft, Copy } from 'lucide-react';
import Link from 'next/link';

export default function QuoteSendPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/crm/quotes" className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="page-title mb-0">Send Quote</h1>
          <p className="text-xs text-muted-foreground">QT-2024-001 · TechCorp Inc · $48,000</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">Enterprise License — TechCorp Inc</p>
          <p className="text-sm text-muted-foreground mt-0.5">Valid until Oct 31, 2024 · Created Oct 1, 2024</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"><Eye className="h-3.5 w-3.5" />Preview</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"><Download className="h-3.5 w-3.5" />PDF</button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-[hsl(246,80%,60%)]" />Send by Email</h2>
        {[
          { label: 'To', value: 'sarah.johnson@techcorp.com' },
          { label: 'CC', value: '' },
          { label: 'Subject', value: 'Quote QT-2024-001 · Enterprise License — AutopilotMonster' },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
            <input defaultValue={f.value} className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
        ))}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Message</label>
          <textarea rows={5} defaultValue={"Hi Sarah,\n\nPlease find attached our proposal for the Enterprise License (QT-2024-001).\n\nThis quote is valid until October 31, 2024. Please let me know if you have any questions.\n\nBest regards,\nAmit Saroj"} className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] resize-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Send className="h-4 w-4" />Send Quote</button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2"><LinkIcon className="h-4 w-4 text-[hsl(246,80%,60%)]" />Share Public Link</h2>
        <p className="text-sm text-muted-foreground">Generate a shareable link so the client can view and accept the quote online.</p>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-muted text-muted-foreground font-mono truncate">https://app.crm.com/q/view/QT-2024-001-abc123</div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"><Copy className="h-3.5 w-3.5" />Copy</button>
        </div>
      </div>
    </div>
  );
}
