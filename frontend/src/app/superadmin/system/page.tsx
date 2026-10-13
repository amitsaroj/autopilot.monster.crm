'use client';

import Link from 'next/link';
import {
  Server,
  ArrowRight,
  Cpu,
  Database,
  HardDrive,
  Calendar,
  Users2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

const SYSTEM_MODULES = [
  {
    label: 'Workers',
    href: '/superadmin/system/workers',
    icon: Cpu,
    desc: 'Background job workers status',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    stat: '8 Running',
  },
  {
    label: 'Queues',
    href: '/superadmin/system/queues',
    icon: Database,
    desc: 'Redis job queue health',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    stat: '142 Pending',
  },
  {
    label: 'Scheduler',
    href: '/superadmin/system/scheduler',
    icon: Calendar,
    desc: 'Cron jobs and scheduled tasks',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    stat: '12 Jobs',
  },
  {
    label: 'Storage',
    href: '/superadmin/system/storage',
    icon: HardDrive,
    desc: 'S3/GCS storage utilization',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    stat: '2.4TB Used',
  },
  {
    label: 'Events',
    href: '/superadmin/system/events',
    icon: Zap,
    desc: 'System event bus and listeners',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    stat: '284 Events',
  },
];

const SYS_HEALTH = [
  { label: 'API Server', status: 'HEALTHY', uptime: '99.98%' },
  { label: 'Worker Pool', status: 'HEALTHY', uptime: '99.94%' },
  { label: 'Message Queue', status: 'HEALTHY', uptime: '100%' },
  { label: 'Storage Layer', status: 'DEGRADED', uptime: '98.12%' },
];

export default function SuperAdminSystemPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
            All Systems Operational
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">System Control</h1>
        <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
          Platform Runtime Management
        </p>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SYS_HEALTH.map((s) => (
          <div
            key={s.label}
            className={`p-5 rounded-2xl border transition-all ${s.status === 'HEALTHY' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {s.status === 'HEALTHY' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              )}
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${s.status === 'HEALTHY' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}
              >
                {s.status}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-1">Uptime: {s.uptime}</p>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          System Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SYSTEM_MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="p-6 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}
                >
                  <mod.icon className={`w-5 h-5 ${mod.color}`} />
                </div>
                {mod.stat && (
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    {mod.stat}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-blue-400 transition-colors mb-1">
                {mod.label}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{mod.desc}</p>
              <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-blue-400 transition-colors uppercase tracking-wide">
                Open{' '}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'CPU Usage',
            value: '34%',
            icon: Cpu,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Memory Used',
            value: '8.2 GB',
            icon: Server,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Queue Depth',
            value: '142',
            icon: Database,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Active Workers',
            value: '8 / 12',
            icon: Users2,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                {s.label}
              </p>
              <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
