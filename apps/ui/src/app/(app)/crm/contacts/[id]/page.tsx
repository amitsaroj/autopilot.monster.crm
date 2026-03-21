import { ArrowLeft, Phone, Mail, MessageSquare, Edit, Trash2, FileText, Link2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/crm/contacts" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="page-title">Sarah Johnson</h1>
          <p className="page-description">TechCorp · Account Executive</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Phone className="h-4 w-4" /> Call</button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Mail className="h-4 w-4" /> Email</button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><MessageSquare className="h-4 w-4" /> Message</button>
          <Link href={`/crm/contacts/${params.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Edit className="h-4 w-4" /> Edit</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: info */}
        <div className="col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xl font-bold text-[hsl(246,80%,60%)] mb-3">SJ</div>
              <h2 className="font-semibold text-foreground">Sarah Johnson</h2>
              <p className="text-sm text-muted-foreground">Account Executive at TechCorp</p>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Email', value: 'sarah@techcorp.com', icon: Mail },
                { label: 'Phone', value: '+1 (555) 234-5678', icon: Phone },
                { label: 'LinkedIn', value: 'linkedin.com/in/sarahj', icon: Link2 },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 text-muted-foreground">
                  <f.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-3">Linked Deals</h3>
            {['Enterprise License $48k', 'Support Contract $12k'].map((deal) => (
              <div key={deal} className="py-2 border-b border-border last:border-0 text-sm text-muted-foreground">{deal}</div>
            ))}
          </div>
        </div>

        {/* Right: tabs */}
        <div className="col-span-2 rounded-xl border border-border bg-card">
          <div className="flex border-b border-border">
            {['Activities', 'Notes', 'Emails', 'Calls', 'Files'].map((tab) => (
              <button key={tab} className="px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-[hsl(246,80%,60%)] transition-colors first:text-foreground first:border-[hsl(246,80%,60%)]">
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Meeting scheduled</p>
                <p className="text-xs text-muted-foreground">Product demo — tomorrow at 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Call completed</p>
                <p className="text-xs text-muted-foreground">Discussed pricing — 24 minutes · 2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
