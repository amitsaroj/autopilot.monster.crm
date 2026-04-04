"use client";

import Link from 'next/link';
import {
  Users, Building2, Target, FileText, Mail,
  MessageSquare, BarChart3, BookOpen, Package,
  Search, Settings, HeadphonesIcon, Activity,
  Briefcase, ArrowRight, TrendingUp, DollarSign
} from 'lucide-react';

const CRM_MODULES = [
  { label: 'Contacts', href: '/admin/crm/contacts', icon: Users, desc: 'Manage all contacts', color: 'text-blue-400', bg: 'bg-blue-500/10', stat: '1,248' },
  { label: 'Companies', href: '/admin/crm/companies', icon: Building2, desc: 'Company records', color: 'text-indigo-400', bg: 'bg-indigo-500/10', stat: '184' },
  { label: 'Deals', href: '/admin/crm/deals', icon: Target, desc: 'Active deals & pipeline', color: 'text-emerald-400', bg: 'bg-emerald-500/10', stat: '67' },
  { label: 'Leads', href: '/admin/crm/leads', icon: TrendingUp, desc: 'Lead management', color: 'text-amber-400', bg: 'bg-amber-500/10', stat: '312' },
  { label: 'Dashboard', href: '/admin/crm/dashboard', icon: BarChart3, desc: 'CRM analytics overview', color: 'text-purple-400', bg: 'bg-purple-500/10', stat: '' },
  { label: 'Emails', href: '/admin/crm/emails', icon: Mail, desc: 'Email activity', color: 'text-sky-400', bg: 'bg-sky-500/10', stat: '24 new' },
  { label: 'Inbox', href: '/admin/crm/inbox', icon: MessageSquare, desc: 'Omnichannel inbox', color: 'text-green-400', bg: 'bg-green-500/10', stat: '8 open' },
  { label: 'Documents', href: '/admin/crm/documents', icon: FileText, desc: 'Document library', color: 'text-orange-400', bg: 'bg-orange-500/10', stat: '94' },
  { label: 'Products', href: '/admin/crm/products', icon: Package, desc: 'Product catalog', color: 'text-rose-400', bg: 'bg-rose-500/10', stat: '6' },
  { label: 'Quotes', href: '/admin/crm/quotes', icon: DollarSign, desc: 'Quote management', color: 'text-teal-400', bg: 'bg-teal-500/10', stat: '5 active' },
  { label: 'Knowledge Base', href: '/admin/crm/kb', icon: BookOpen, desc: 'Help articles', color: 'text-violet-400', bg: 'bg-violet-500/10', stat: '6 articles' },
  { label: 'Support', href: '/admin/crm/support', icon: HeadphonesIcon, desc: 'Support tickets', color: 'text-cyan-400', bg: 'bg-cyan-500/10', stat: '3 open' },
  { label: 'Reports', href: '/admin/crm/reports', icon: Activity, desc: 'CRM reports', color: 'text-lime-400', bg: 'bg-lime-500/10', stat: '' },
  { label: 'Search', href: '/admin/crm/search', icon: Search, desc: 'Global CRM search', color: 'text-gray-400', bg: 'bg-gray-500/10', stat: '' },
  { label: 'Settings', href: '/admin/crm/settings', icon: Settings, desc: 'CRM configuration', color: 'text-slate-400', bg: 'bg-slate-500/10', stat: '' },
];

const TOP_KPIs = [
  { label: 'Total Contacts', value: '1,248', trend: '+12%', up: true },
  { label: 'Open Deals', value: '67', trend: '+8%', up: true },
  { label: 'Monthly Revenue', value: '$89K', trend: '+34%', up: true },
  { label: 'Win Rate', value: '34%', trend: '-2%', up: false },
];

export default function AdminCRMPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">CRM Control Center</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Admin CRM Suite Overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TOP_KPIs.map(kpi => (
          <div key={kpi.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className="text-2xl font-black text-white mb-1">{kpi.value}</p>
            <span className={`text-[10px] font-black ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>{kpi.trend} vs last month</span>
          </div>
        ))}
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">CRM Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CRM_MODULES.map(mod => (
            <Link key={mod.href} href={mod.href}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}>
                  <mod.icon className={`w-4 h-4 ${mod.color}`} />
                </div>
                {mod.stat && <span className="text-[10px] text-gray-600 font-black">{mod.stat}</span>}
              </div>
              <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors mb-0.5">{mod.label}</p>
              <p className="text-[10px] text-gray-500 leading-relaxed flex-1">{mod.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-[10px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
