'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { taskService, Task } from '@/services/task.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await taskService.getTask(id);
        setTask(parseApiData<Task>(res));
      } catch {
        toast.error('Failed to load task');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  if (!task) return <p className="text-sm text-muted-foreground">Task not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <Link href="/crm/tasks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Tasks
      </Link>
      <h1 className="page-title">{task.title}</h1>
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <p className="text-sm"><span className="text-muted-foreground">Status:</span> {task.status}</p>
        <p className="text-sm"><span className="text-muted-foreground">Priority:</span> {task.priority}</p>
        {task.dueDate && <p className="text-sm"><span className="text-muted-foreground">Due:</span> {new Date(task.dueDate).toLocaleDateString()}</p>}
        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
      </div>
    </div>
  );
}
