"use client";

import { useState } from 'react';
import {
  Rocket, Play, Users, Globe, CheckCircle2,
  ArrowRight, Star, Zap, Building2, BarChart3,
  MessageSquare, Phone, Workflow, Brain, CreditCard
} from 'lucide-react';

const DEMO_FEATURES = [
  { icon: Users, label: 'CRM & Contacts', desc: 'Full contact, company and deal management', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Brain, label: 'AI Agents', desc: 'Autonomous AI sales and support agents', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Workflow, label: 'Workflow Engine', desc: 'Visual automation builder with 100+ triggers', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: MessageSquare, label: 'WhatsApp Inbox', desc: 'Unified omnichannel messaging center', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Phone, label: 'Voice Cloud', desc: 'Outbound dialer, IVR, and call analytics', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: BarChart3, label: 'Analytics Suite', desc: 'Revenue dashboards and pipeline insights', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: CreditCard, label: 'Billing Engine', desc: 'Subscriptions, invoices, and usage billing', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Globe, label: 'Marketplace', desc: 'Install plugins and third-party integrations', color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const DEMO_TENANTS = [
  { name: 'Acme Corp', plan: 'Enterprise', users: 45, status: 'ACTIVE', industry: 'SaaS' },
  { name: 'GlobalSales Inc', plan: 'Growth', users: 18, status: 'ACTIVE', industry: 'Sales' },
  { name: 'TechStartup X', plan: 'Trial', users: 5, status: 'TRIAL', industry: 'Tech' },
];

export default function DemoOrchestrationPage() {
  const [activatingDemo, setActivatingDemo] = useState(false);
  const [demoActive, setDemoActive] = useState(false);

  const handleActivateDemo = () => {
    setActivatingDemo(true);
    setTimeout(() => {
      setActivatingDemo(false);
      setDemoActive(true);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              Platform Demo Mode
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Demo Orchestration</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Provision Live Demo Environments for Prospects</p>
        </div>
        <button
          onClick={handleActivateDemo}
          disabled={activatingDemo || demoActive}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          {activatingDemo ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Provisioning...</>
          ) : demoActive ? (
            <><CheckCircle2 className="w-4 h-4" /> Demo Live</>
          ) : (
            <><Rocket className="w-4 h-4" /> Activate Demo</>
          )}
        </button>
      </div>

      {/* Demo Status Banner */}
      {demoActive && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-black text-white">Demo Environment Active</p>
            <p className="text-xs text-gray-400 mt-0.5">Demo tenant provisioned with seed data. Access at <span className="text-indigo-400 font-mono">demo.autopilotmonster.com</span></p>
          </div>
          <a href="https://demo.autopilotmonster.com" target="_blank"
            className="ml-auto px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 rounded-xl text-xs font-black text-emerald-400 transition-all flex items-center gap-2 shrink-0">
            Open Demo <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Feature Showcase */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" /> Platform Features Available in Demo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_FEATURES.map(f => (
            <div key={f.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group cursor-pointer">
              <div className={`p-3 rounded-xl ${f.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-sm font-black text-white mb-1">{f.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Tenants */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" /> Active Demo Tenants
        </h2>
        <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                {['Organization', 'Plan', 'Users', 'Industry', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {DEMO_TENANTS.map(t => (
                <tr key={t.name} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs border border-indigo-500/20">
                        {t.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-indigo-300 font-black">{t.plan}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5" /> {t.users}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-400">{t.industry}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${t.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs font-black text-gray-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all flex items-center gap-1.5 ml-auto">
                      <Play className="w-3 h-3" /> Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Config Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Demo Seed Configuration
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Seed Contacts', value: '500', enabled: true },
              { label: 'Seed Deals', value: '120', enabled: true },
              { label: 'Seed Campaigns', value: '12', enabled: true },
              { label: 'AI Agent Responses', value: 'Mock Mode', enabled: true },
              { label: 'Billing Simulation', value: 'Sandbox', enabled: true },
              { label: 'Auto-expire Demo', value: '48 hours', enabled: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-xs text-gray-400">{item.label}</span>
                <span className="text-xs font-black text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border border-indigo-500/20">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Reset Demo Data', desc: 'Re-seed all demo entities freshly' },
              { label: 'Extend Demo Period', desc: 'Extend trial expiry by 24 hours' },
              { label: 'Share Demo Link', desc: 'Generate branded prospect link' },
              { label: 'Archive Demo Tenant', desc: 'Remove environment after sales close' },
            ].map(action => (
              <button key={action.label} className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-indigo-500/20 transition-all group">
                <p className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors">{action.label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
