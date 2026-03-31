'use client';

import { 
  Phone, 
  Mail, 
  Users, 
  FileText, 
  CheckSquare, 
  MessageSquare,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Activity, ActivityType } from '@/services/activity.service';
import { cn } from '@/lib/utils';

const typeConfig = {
  [ActivityType.CALL]: { icon: Phone, color: 'text-blue-500', bg: 'bg-blue-50' },
  [ActivityType.EMAIL]: { icon: Mail, color: 'text-purple-500', bg: 'bg-purple-50' },
  [ActivityType.MEETING]: { icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
  [ActivityType.NOTE]: { icon: FileText, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  [ActivityType.TASK]: { icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-50' },
  [ActivityType.WHATSAPP]: { icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Clock className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-sm font-medium italic">No activity history yet.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent dark:before:via-border">
      {activities.map((activity, idx) => {
        const Config = typeConfig[activity.type] || typeConfig[ActivityType.NOTE];
        const Icon = Config.icon;

        return (
          <div key={activity.id} className="relative flex items-start gap-4 group">
            <div className={cn(
              "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white dark:border-background shadow-sm transition group-hover:scale-110",
              Config.bg, Config.color
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 bg-white dark:bg-card/50 p-4 rounded-2xl border border-gray-100 dark:border-border shadow-soft transition hover:border-indigo-100 dark:hover:border-indigo-900/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {activity.type} • {new Date(activity.occurredAt).toLocaleDateString()}
                </span>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                {activity.subject}
              </h4>
              {activity.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {activity.description}
                </p>
              )}
              {activity.durationMinutes && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-3 h-3" />
                  {activity.durationMinutes} minutes
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
