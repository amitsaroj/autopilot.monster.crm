'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Trash2, Loader2, CheckCircle2, Clock, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { ListPagination } from '@/components/ui/ListPagination';
import { usePaginatedCrmList } from '@/hooks/usePaginatedCrmList';
import { taskService } from '@/services/task.service';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    status: 'OPEN',
  });

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
  } = usePaginatedCrmList<Task>(fetchTasks);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/tasks', formData);
      toast.success('Operational task initialized');
      setIsModalOpen(false);
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Configuration failed');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'OPEN' : 'COMPLETED';
    try {
      await api.put(`/crm/tasks/${task.id}`, { status: newStatus });
      toast.success(newStatus === 'COMPLETED' ? 'Task finalized' : 'Task reactivated');
      reload();
    } catch {
      toast.error('Status mutation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm dissolution of task?')) return;
    try {
      await api.delete(`/crm/tasks/${id}`);
      toast.success('Task dissolved');
      reload();
    } catch {
      toast.error('Dissolution failed');
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'HIGH':
        return 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM':
        return 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Efficiency Layer Active
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Task Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Orchestrate operational follow-ups and engagement cycles
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4" /> Initialize Task
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full md:max-w-md p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all shadow-inner">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search task title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide mb-4">
            {error}
          </p>
          <button
            type="button"
            onClick={() => reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide"
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
                className="p-6 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group flex items-center gap-6 relative overflow-hidden backdrop-blur-sm"
              >
                <button
                  onClick={() => handleToggleStatus(task)}
                  aria-label={`${task.status === 'COMPLETED' ? 'Reopen' : 'Complete'} task: ${task.title}`}
                  className={cn(
                    'shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shadow-lg',
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'bg-card border-border text-transparent hover:border-blue-500 hover:text-blue-500/40',
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      'text-base font-black tracking-tight transition-all',
                      task.status === 'COMPLETED'
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400',
                    )}
                  >
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border',
                        getPriorityColor(task.priority),
                      )}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                      ID: {task.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-all">
                  <button
                    onClick={() => handleDelete(task.id)}
                    aria-label={`Delete task: ${task.title}`}
                    className="p-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">
                  No operational tasks detected in this cycle.
                </p>
              </div>
            )}
          </div>
          <ListPagination meta={meta} page={page} onPageChange={setPage} />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-xl bg-card border border-border shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-8 flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-blue-500" /> Initialize Task
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Task Designation
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                  placeholder="e.g. Follow up with Acme Corp"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Priority Matrix
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                  >
                    <option value="LOW" className="bg-card">
                      Minimal Risk (Low)
                    </option>
                    <option value="MEDIUM" className="bg-card">
                      Standard Ops (Medium)
                    </option>
                    <option value="HIGH" className="bg-card">
                      Critical Path (High)
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Deadline Vector
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Contextual Metadata
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 min-h-[100px] resize-none"
                  placeholder="Provide additional task specifications..."
                />
              </div>

              <div className="pt-6 border-t border-border flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-card border-border border hover:bg-white/[0.05] text-foreground rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
