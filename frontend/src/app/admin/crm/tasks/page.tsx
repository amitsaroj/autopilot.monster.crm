'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Activity,
  Calendar,
  User,
  Flag,
  ListTodo,
  Circle,
  PlayCircle,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { ListPagination } from '@/components/ui/ListPagination';
import { usePaginatedCrmList } from '@/hooks/usePaginatedCrmList';
import { taskService } from '@/services/task.service';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status: string;
  contact?: { firstName: string; lastName: string };
  deal?: { name: string };
  createdAt: string;
}

type StatusFilter = 'ALL' | 'OPEN' | 'COMPLETED';

export default function TasksManagementPage() {
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const fetchTasks = useCallback(
    (params: Parameters<typeof taskService.getTasks>[0]) => taskService.getTasks(params),
    [],
  );

  const {
    items: tasks,
    meta,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    reload,
  } = usePaginatedCrmList<Task>(fetchTasks, {
    status: filter === 'ALL' ? undefined : filter,
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      HIGH: 'bg-red-500/10 text-red-500 border-red-500/20',
      MEDIUM: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      LOW: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full border text-[8px] font-semibold uppercase tracking-wide ${colors[priority] || 'bg-card text-muted-foreground border-border'}`}
      >
        {priority} Priority
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-gray-700" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Operational Lattice Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Task-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Action Artifacts
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage Operational TODos, Deadlines & Accountability
          </p>
        </div>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Provision Action Artifact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search by action title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
          />
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Execution State
          </span>
          <div className="flex bg-card rounded-lg p-1">
            {(['ALL', 'OPEN', 'COMPLETED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${filter === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-muted-foreground hover:text-foreground dark:hover:text-white'}`}
              >
                {s === 'OPEN' ? 'PENDING' : s}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => reload()}
          className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between group cursor-pointer hover:bg-blue-500/10 transition-all"
        >
          <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide leading-none">
            Refresh
          </span>
          <RefreshCw className="w-4 h-4 text-blue-700 dark:text-blue-400 opacity-60 group-hover:rotate-180 transition-all duration-500" />
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide mb-4">{error}</p>
          <button
            type="button"
            onClick={() => reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wide"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-6 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group flex items-center justify-between gap-6 relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-card rounded-full blur-3xl group-hover:bg-blue-500/5 transition-colors" />

                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="shrink-0">{getStatusIcon(task.status)}</div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4
                        className={`text-sm font-semibold uppercase tracking-tight transition-all ${task.status === 'COMPLETED' ? 'text-gray-700 line-through' : 'text-foreground group-hover:text-blue-400'}`}
                      >
                        {task.title}
                      </h4>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-1 max-w-2xl">
                      {task.description ||
                        'System-generated operational artifact for workspace orchestration.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-10 shrink-0">
                  <div className="hidden md:flex flex-col items-end gap-1.5 min-w-[120px]">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold uppercase tracking-wide leading-none">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 opacity-40 shrink-0" />{' '}
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'NO DEADLINE'}
                    </div>
                    {task.contact && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-tighter">
                        <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 opacity-40 shrink-0" />{' '}
                        {task.contact.firstName} {task.contact.lastName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="p-20 text-center space-y-6 rounded-xl border border-dashed border-border bg-card">
                <ListTodo className="w-16 h-16 text-gray-800 mx-auto opacity-20" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                    No Action Artifacts Detected
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-tighter font-medium max-w-xs mx-auto">
                    The operational lattice is currently optimized. Provide a new action artifact to
                    begin tracking workspace accountability.
                  </p>
                </div>
              </div>
            )}
          </div>
          <ListPagination meta={meta} page={page} onPageChange={setPage} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-10 rounded-xl bg-card border border-border space-y-6 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all text-center">
              <Flag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter">
              Priority Forensics
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Automatically identify critical-path action artifacts and escalate high-priority
            dispatches based on deal-velocity and customer sentiment pulse.
          </p>
        </div>
        <div className="p-10 rounded-xl bg-card border border-border space-y-6 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all text-center">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter">
              Latency Monitor
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Monitor operational delay forensics across the workspace. Analyze time-to-completion
            (TTC) for various task archetypes and optimize execution patterns.
          </p>
        </div>
        <div className="p-10 rounded-xl bg-blue-600 to-blue-600 text-white space-y-4 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-card rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wide leading-tight">
                Persistence Integrity
              </h4>
              <p className="text-xs text-foreground/60 font-semibold uppercase tracking-tighter italic">
                Status: Verified Ops
              </p>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed font-bold uppercase tracking-tighter">
            Workspace action artifacts are synchronized with the systemic integrity lattice every 30
            seconds for real-time accountability tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
