"use client";

import { useState } from 'react';
import { ShieldCheck, UserCircle, Users, LayoutDashboard, UserCheck, Key, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DemoPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const demoUsers = [
    { 
      role: 'SuperAdmin', 
      email: 'superadmin@autopilotmonster.com', 
      icon: ShieldCheck, 
      color: 'text-indigo-500',
      bgIcon: 'bg-indigo-500/10',
      description: 'Full platform control, billing management, and security settings access.'
    },
    { 
      role: 'Admin', 
      email: 'admin@autopilotmonster.com', 
      icon: LayoutDashboard, 
      color: 'text-blue-500',
      bgIcon: 'bg-blue-500/10',
      description: 'Manage users, teams, workflows, and high-level campaign oversight.'
    },
    { 
      role: 'Manager', 
      email: 'manager@autopilotmonster.com', 
      icon: UserCheck, 
      color: 'text-green-500',
      bgIcon: 'bg-green-500/10',
      description: 'Monitor sales performance, lead assignments, and staff activity.'
    },
    { 
      role: 'User', 
      email: 'user@autopilotmonster.com', 
      icon: UserCircle, 
      color: 'text-gray-400',
      bgIcon: 'bg-gray-400/10',
      description: 'Standard access for CRM tasks, lead engagement, and task management.'
    },
    { 
      role: 'Agent', 
      email: 'agent@autopilotmonster.com', 
      icon: Users, 
      color: 'text-amber-500',
      bgIcon: 'bg-amber-500/10',
      description: 'Focus on omnichannel support, voice AI, and ticket resolution.'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] pt-32 pb-20 px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
            <Key className="w-3.5 h-3.5" /> Demo Environment Access
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white animate-in fade-in slide-in-from-top-6 duration-1000">
             Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Persona View</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Select a role below to explore the CRM from different perspectives. Each account is pre-seeded with sample data and unique permission levels.
          </p>
        </div>

        {/* Global Password Banner */}
        <div className="max-w-3xl mx-auto mb-12 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-500/30 transition-all duration-300 shadow-2xl">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                    <Key className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg">Global Demo Password</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Shared across all demo accounts</p>
                </div>
            </div>
            
            <button 
                onClick={() => copyToClipboard('SecureP@ssw0rd!', 'Password')}
                className="w-full md:w-auto px-6 py-3 bg-gray-50 dark:bg-white/[0.05] hover:bg-gray-100 dark:hover:bg-white/[0.1] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 group/btn shadow-sm"
            >
                <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-tight">SecureP@ssw0rd!</code>
                {copied === 'Password' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover/btn:text-indigo-500 dark:group-hover/btn:text-white" />}
            </button>
        </div>

        {/* User Role Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoUsers.map((user, idx) => (
            <div 
              key={user.role} 
              className="group p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] hover:bg-white dark:hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all duration-500 relative flex flex-col justify-between animate-in fade-in slide-in-from-bottom-8 shadow-sm hover:shadow-xl"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
               {/* Background Glow Overlay */}
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
                   <div className={`absolute top-0 right-0 w-32 h-32 ${user.bgIcon} rounded-full blur-[60px]`} />
               </div>

               <div>
                   <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${user.bgIcon} border border-white/[0.05] flex items-center justify-center shadow-inner`}>
                         <user.icon className={`w-7 h-7 ${user.color}`} />
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={`text-xs font-black uppercase tracking-widest ${user.color}`}>{user.role}</span>
                         <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Read/Write Access</span>
                      </div>
                   </div>

                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{user.role} Account</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                     {user.description}
                   </p>
               </div>

               <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] group-hover:border-indigo-500/20 transition-all">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Email Identity</span>
                         <button 
                            onClick={() => copyToClipboard(user.email, user.role)}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors"
                         >
                            {copied === user.role ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-500 hover:text-white" />}
                         </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-300 truncate block">{user.email}</span>
                   </div>

                   <Link 
                      href="/login" 
                      className="w-full py-4 px-6 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 drop-shadow-xl"
                    >
                      Login Persona <ArrowRight className="w-4 h-4" />
                   </Link>
               </div>
            </div>
          ))}
          
          {/* FAQ/CTA Card */}
          <div className="p-8 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4 bg-indigo-500/[0.02]">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <ExternalLink className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Need a Custom Demo?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
                  Contact our sales team for a custom tailored sandbox environment with your own dataset.
              </p>
              <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors flex items-center gap-2">
                  Speak to Sales <ArrowRight className="w-4 h-4" />
              </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
