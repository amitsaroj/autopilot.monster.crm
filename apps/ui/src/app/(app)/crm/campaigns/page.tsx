"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Users, 
  Phone, 
  Play, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  ArrowRight,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function CampaignsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [step, setStep] = useState(1);

  const stats = [
    { label: 'Active Campaigns', value: '12', icon: Play, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: 'Total Calls', value: '1,284', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Qualified Leads', value: '432', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: 'Pending Leads', value: '89', icon: Users, color: 'text-orange-600', bg: 'bg-orange-500/10' },
  ];

  const campaigns = [
    { id: 1, name: 'Q1 Real Estate Leads', status: 'Running', leads: 450, completed: 320, qualified: 85, agent: 'Sarah (Sales)' },
    { id: 2, name: 'SaaS Beta Outreach', status: 'Scheduled', leads: 120, completed: 0, qualified: 0, agent: 'AI Onboarding' },
    { id: 3, name: 'Insurance Follow-up', status: 'Paused', leads: 890, completed: 450, qualified: 112, agent: 'Support Agent' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">AI Voice Campaigns</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 italic">Scale your outreach with high-fidelity autonomous agents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button 
            onClick={() => { setShowUpload(true); setStep(1); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/[0.05] shadow-sm flex items-start justify-between group hover:border-indigo-500/30 transition-all"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/[0.05] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-transparent text-left">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qualified</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      c.status === 'Running' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      c.status === 'Paused' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border-transparent'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5 min-w-[120px]">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                        <span>{Math.round((c.completed / c.leads) * 100)}%</span>
                        <span>{c.completed}/{c.leads}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.completed / c.leads) * 100}%` }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {c.agent}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {c.qualified}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Wizard Modal */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpload(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold dark:text-white">Create Campaign</h2>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-8 h-1 rounded-full ${i <= step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-white/10'}`} />
                    ))}
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Campaign Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Real Estate Q1 Follow-up"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer group">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold dark:text-white">Drop your CSV lead list here</p>
                      <p className="text-xs text-gray-500 mt-1">Expected columns: firstName, lastName, phone, email</p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 py-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Select AI Agent</h3>
                    <div className="space-y-3">
                      {['Sarah (Sales Expert)', 'John (Support)', 'Alex (Inbound Specialist)'].map(agent => (
                        <div key={agent} className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-between hover:border-indigo-500/50 cursor-pointer transition-all bg-gray-50/50 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                            <span className="font-bold dark:text-white">{agent}</span>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                  <button 
                    disabled={step === 1}
                    onClick={() => setStep(s => s - 1)}
                    className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-white disabled:opacity-0 transition-all font-bold"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => step < 3 ? setStep(s => s + 1) : setShowUpload(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all"
                  >
                    {step === 3 ? 'Launch Campaign' : 'Next Step'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
