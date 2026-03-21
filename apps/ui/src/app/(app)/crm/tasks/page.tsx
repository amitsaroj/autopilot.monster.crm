'use client';
import { CheckSquare, Plus, Search, Filter, Calendar, AlertCircle, Clock, CheckCircle2, User, Flag } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const tasks = [
  { id: 1, title: 'Follow up with Sarah at TechCorp', due: 'Today', priority: 'High', assignee: 'You', related: 'TechCorp · Enterprise Deal', done: false },
  { id: 2, title: 'Send contract to GlobalManufacturing', due: 'Today', priority: 'High', assignee: 'You', related: 'GlobalManufacturing', done: false },
  { id: 3, title: 'Schedule demo for Acme Solutions', due: 'Tomorrow', priority: 'Medium', assignee: 'Alex Kim', related: 'Acme Solutions', done: false },
  { id: 4, title: 'Update deal stages in pipeline', due: 'This week', priority: 'Low', assignee: 'You', related: 'General', done: false },
  { id: 5, title: 'Send welcome email to StartupXYZ', due: 'Done', priority: 'Medium', assignee: 'You', related: 'StartupXYZ', done: true },
  { id: 6, title: 'Prepare Q3 pipeline report', due: 'Done', priority: 'High', assignee: 'You', related: 'General', done: true },
];

const priorityStyle: Record<string, string> = {
  High: 'text-red-400',
  Medium: 'text-yellow-500',
  Low: 'text-blue-400',
};

export default function TasksPage() {
  const [completed, setCompleted] = useState<number[]>([5, 6]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-description">{tasks.filter(t => !t.done).length} open · {tasks.filter(t => t.done).length} completed today</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" />Filter</button>
          <Link href="/crm/tasks/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Task
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Due Today', value: '2', icon: AlertCircle, color: 'text-red-400' },
          { label: 'This Week', value: '4', icon: Calendar, color: 'text-yellow-500' },
          { label: 'Overdue', value: '1', icon: Clock, color: 'text-orange-400' },
          { label: 'Completed', value: '12', icon: CheckCircle2, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search tasks..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <div className="ml-auto flex gap-2">
          {['All', 'Today', 'This Week', 'Overdue', 'Completed'].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open Tasks</div>
        <div className="divide-y divide-border">
          {tasks.filter(t => !t.done).map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-4 py-4 hover:bg-muted/20 transition-colors group">
              <button
                onClick={() => setCompleted(p => [...p, task.id])}
                className="w-5 h-5 rounded border-2 border-border hover:border-[hsl(246,80%,60%)] transition-colors shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link href={`/crm/tasks/${task.id}`} className="font-medium text-foreground hover:text-[hsl(246,80%,60%)] text-sm">{task.title}</Link>
                <p className="text-xs text-muted-foreground mt-0.5">{task.related}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                <span className={`flex items-center gap-1 font-medium ${priorityStyle[task.priority]}`}>
                  <Flag className="h-3 w-3" />{task.priority}
                </span>
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignee}</span>
                <span className={`flex items-center gap-1 ${task.due === 'Today' ? 'text-red-400 font-semibold' : ''}`}>
                  <Calendar className="h-3 w-3" />{task.due}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</div>
        <div className="divide-y divide-border">
          {tasks.filter(t => t.done).map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-4 py-4 opacity-50">
              <CheckSquare className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-sm line-through text-muted-foreground">{task.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
