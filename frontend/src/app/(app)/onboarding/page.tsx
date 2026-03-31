import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { id: 1, title: 'Set up your workspace', desc: 'Add your company name, logo and timezone', done: true, href: '/settings/workspace' },
  { id: 2, title: 'Invite teammates', desc: 'Bring your sales team on board', done: true, href: '/settings/users/invite' },
  { id: 3, title: 'Import your first contacts', desc: 'Upload a CSV list of existing contacts', done: false, href: '/import' },
  { id: 4, title: 'Create your first pipeline', desc: 'Define deal stages that match your sales process', done: false, href: '/crm/pipelines/new' },
  { id: 5, title: 'Connect email and phone', desc: 'Sync Gmail and configure a phone number', done: false, href: '/settings/integrations' },
  { id: 6, title: 'Build your first workflow', desc: 'Automate a repetitive task with a workflow', done: false, href: '/workflows/new' },
];

export default function OnboardingPage() {
  const doneCount = steps.filter(s => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(246,80%,60%)] mx-auto mb-4 flex items-center justify-center text-3xl">🚀</div>
        <h1 className="text-2xl font-bold text-foreground">Welcome to AutopilotMonster</h1>
        <p className="text-muted-foreground mt-2">Let's get your CRM ready in 6 quick steps</p>
        <div className="mt-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span className="font-semibold text-foreground">{doneCount} / {steps.length} complete</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[hsl(246,80%,60%)] transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{percent}%</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <Link key={step.id} href={step.href} className={`flex items-center gap-4 p-5 rounded-xl border transition-colors hover:border-[hsl(246,80%,60%)]/40 ${step.done ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${step.done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              {step.done ? <CheckCircle2 className="h-5 w-5" /> : step.id}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${step.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
            {!step.done && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
          </Link>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need help? <a href="#" className="text-[hsl(246,80%,60%)] hover:underline">View setup guide</a> or <a href="#" className="text-[hsl(246,80%,60%)] hover:underline">chat with support</a></p>
      </div>
    </div>
  );
}
