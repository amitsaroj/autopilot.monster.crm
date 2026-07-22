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
      MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${colors[priority] || 'bg-white/5 text-gray-400 border-white/10'}`}
      >
        {priority} Priority
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-5 h-5 text-indigo-500 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-gray-700" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              Operational Lattice Active
            </span>
            <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Task-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight text-sans">
            Action Artifacts
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Manage Operational TODos, Deadlines & Accountability
          </p>
        </div>
        <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Provision Action Artifact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all">
          <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
          <input
            type="text"
            placeholder="Search by action title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
          />
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
          <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
            Execution State
          </span>
          <div className="flex bg-white/5 rounded-lg p-1">
            {(['ALL', 'OPEN', 'COMPLETED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${filter === s ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-600 hover:text-white'}`}
              >
                {s === 'OPEN' ? 'PENDING' : s}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => reload()}
          className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between group cursor-pointer hover:bg-indigo-500/10 transition-all"
        >
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none">
            Refresh
          </span>
          <RefreshCw className="w-4 h-4 text-indigo-400 opacity-60 group-hover:rotate-180 transition-all duration-500" />
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-gray-500 font-black text-xs uppercase tracking-widest mb-4">{error}</p>
          <button
            type="button"
            onClick={() => reload()}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest"
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
                className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group flex items-center justify-between gap-6 relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-indigo-500/5 transition-colors" />

                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="shrink-0">{getStatusIcon(task.status)}</div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4
                        className={`text-sm font-black uppercase tracking-tight transition-all ${task.status === 'COMPLETED' ? 'text-gray-700 line-through' : 'text-white group-hover:text-indigo-400'}`}
                      >
                        {task.title}
                      </h4>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-[10px] text-gray-600 font-medium line-clamp-1 max-w-2xl">
                      {task.description ||
                        'System-generated operational artifact for workspace orchestration.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-10 shrink-0">
                  <div className="hidden md:flex flex-col items-end gap-1.5 min-w-[120px]">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 opacity-40 shrink-0" />{' '}
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'NO DEADLINE'}
                    </div>
                    {task.contact && (
                      <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                        <User className="w-3.5 h-3.5 text-emerald-500 opacity-40 shrink-0" />{' '}
                        {task.contact.firstName} {task.contact.lastName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-white transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-600 hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="p-20 text-center space-y-6 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01]">
                <ListTodo className="w-16 h-16 text-gray-800 mx-auto opacity-20" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    No Action Artifacts Detected
                  </p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-tighter font-medium max-w-xs mx-auto">
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
        <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] space-y-6 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all text-center">
              <Flag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              Priority Forensics
            </h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Automatically identify critical-path action artifacts and escalate high-priority
            dispatches based on deal-velocity and customer sentiment pulse.
          </p>
        </div>
        <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] space-y-6 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all text-center">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              Latency Monitor
            </h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Monitor operational delay forensics across the workspace. Analyze time-to-completion
            (TTC) for various task archetypes and optimize execution patterns.
          </p>
        </div>
        <div className="p-10 rounded-[40px] bg-indigo-500 to-purple-600 text-white space-y-4 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest leading-tight">
                Persistence Integrity
              </h4>
              <p className="text-[10px] text-white/60 font-black uppercase tracking-tighter italic">
                Status: Verified Ops
              </p>
            </div>
          </div>
          <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tighter">
            Workspace action artifacts are synchronized with the systemic integrity lattice every 30
            seconds for real-time accountability tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
