"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Clock3, MoreVertical, LayoutGrid, CalendarDays, Zap } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/tasks");
      if (res.data?.data) {
        setTasks(res.data.data);
      }
    } catch (e: any) {
      toast.error("Failed to synchronize scheduler");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = [];
  const totalDays = daysInMonth(year, currentDate.getMonth());
  const startDay = firstDayOfMonth(year, currentDate.getMonth());

  // Fill empty days
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-40 border border-white/5 bg-white/[0.01]" />);
  }

  // Fill actual days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = new Date(year, currentDate.getMonth(), d).toDateString();
    const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dateStr);
    
    days.push(
      <div key={d} className="h-40 border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-2 hover:bg-white/[0.04] transition-all group overflow-hidden">
        <span className="text-sm font-black text-gray-500 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{d}</span>
        <div className="flex flex-col gap-1 overflow-y-auto scrollbar-none">
           {dayTasks.map((t, idx) => (
             <div key={t.id} className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-indigo-500/10">
                {t.title}
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Temporal Orchestration Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Scheduler Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Monitor temporal engagement vectors and scheduled operational nodes</p>
        </div>
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-2xl backdrop-blur-sm shadow-inner">
           <button onClick={prevMonth} className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
           <span className="text-sm font-black text-white uppercase tracking-widest min-w-[140px] text-center">{monthName} {year}</span>
           <button onClick={nextMonth} className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-7 text-center border-b border-white/5 bg-white/[0.01]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest border-r border-white/5 last:border-0">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 focus:outline-none">
            {days}
          </div>
        </div>
      )}
    </div>
  );
}
