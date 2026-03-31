'use client';

import { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search,
  Filter,
  Calendar,
  User,
  MoreVertical,
  Loader2,
  CheckSquare
} from 'lucide-react';
import { taskService, Task, TaskStatus, TaskPriority } from '@/services/task.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await taskService.getTasks();
      setTasks((res as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.OPEN : TaskStatus.COMPLETED;
    try {
      await taskService.updateTask(task.id, { status: newStatus });
      toast.success(newStatus === TaskStatus.COMPLETED ? 'Task completed' : 'Task reopened');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overdueTasks = filteredTasks.filter(t => t.status !== TaskStatus.COMPLETED && t.dueDate && new Date(t.dueDate) < new Date());
  const todayTasks = filteredTasks.filter(t => t.status !== TaskStatus.COMPLETED && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
  const upcomingTasks = filteredTasks.filter(t => t.status !== TaskStatus.COMPLETED && ((t.dueDate && new Date(t.dueDate) > new Date() && new Date(t.dueDate).toDateString() !== new Date().toDateString()) || !t.dueDate));
  const completedTasks = filteredTasks.filter(t => t.status === TaskStatus.COMPLETED);

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="group flex items-center gap-4 p-4 bg-white dark:bg-card/50 rounded-2xl border border-gray-100 dark:border-border hover:shadow-md transition">
      <button 
        onClick={() => handleToggleStatus(task)}
        className={cn(
          "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition",
          task.status === TaskStatus.COMPLETED 
            ? "bg-green-500 border-green-500 text-white" 
            : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"
        )}
      >
        {task.status === TaskStatus.COMPLETED && <CheckCircle2 className="w-4 h-4" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-sm font-bold truncate transition",
          task.status === TaskStatus.COMPLETED ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"
        )}>
          {task.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-wider">
          <span className={cn(
            "flex items-center gap-1",
            task.priority === TaskPriority.HIGH ? "text-red-500" : task.priority === TaskPriority.MEDIUM ? "text-orange-500" : "text-blue-500"
          )}>
            <AlertCircle className="w-3 h-3" />
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={cn(
              "flex items-center gap-1",
              new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED ? "text-red-500" : "text-gray-400"
            )}>
              <Clock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition">
          <User className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Active Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Organize your workflow and never miss a follow-up.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition shadow-xl shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-soft text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <div className="space-y-12 pb-20">
        {overdueTasks.length > 0 && (
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Overdue
            </h3>
            <div className="space-y-3">
              {overdueTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Today
          </h3>
          <div className="space-y-3">
            {todayTasks.length > 0 ? todayTasks.map(task => <TaskItem key={task.id} task={task} />) : (
              <p className="text-sm text-gray-400 italic">No tasks for today. Stay productive!</p>
            )}
          </div>
        </section>

        {(upcomingTasks.length > 0 || completedTasks.length > 0) && (
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" /> Upcoming & Completed
            </h3>
            <div className="space-y-3">
              {upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)}
              {completedTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
