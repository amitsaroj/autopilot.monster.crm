"use client";

import { useState } from 'react';
import { Play, Save, Settings, Plus, ArrowRight, Zap, Mail, MessageSquare, Database, CheckCircle2, MoreHorizontal, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowBuilderPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in -mx-4 sm:mx-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-border bg-card shadow-sm z-10 sticky top-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/workflows" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Automations</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Builder</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Lead Nurturing Sequence</h1>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded border border-green-200">Active</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 border border-input rounded-lg hover:bg-muted text-muted-foreground transition-colors shadow-sm bg-background">
            <Settings className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-input hover:bg-muted text-foreground font-medium text-sm rounded-lg transition-colors shadow-sm">
            <Play className="w-4 h-4 text-green-600" /> Test Run
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white font-medium text-sm rounded-lg transition-colors shadow-sm">
            <Save className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative bg-slate-50">
        
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Builder Canvas Area (Centrally aligned nodes) */}
        <div className="flex-1 overflow-auto relative z-10 flex flex-col items-center py-12 px-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
          
          {/* Node 1: Trigger */}
          <div className="w-[340px] bg-card border-2 border-primary/40 rounded-xl shadow-lg hover:border-primary transition-colors cursor-pointer group relative">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="p-5 flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Trigger</span>
                <h3 className="font-bold text-foreground mt-0.5">New CRM Lead</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">Activates when a new lead enters the "Contact Made" pipeline stage.</p>
              </div>
            </div>
          </div>

          {/* Connection Line */}
          <div className="w-0.5 h-10 bg-gradient-to-b from-primary/40 to-amber-500/40 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer z-10 hover:scale-110 transition-transform shadow-sm">
              <Plus className="w-3 h-3" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-b-2 border-r-2 border-amber-500/40 rotate-45" />
          </div>

          {/* Node 2: Action - AI Assessment */}
          <div className="w-[340px] bg-card border border-border rounded-xl shadow-md hover:border-amber-500/50 transition-colors cursor-pointer group relative">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="p-4 flex gap-4 border-b border-border bg-muted/20">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">AI Action</span>
                <h3 className="font-bold text-foreground mt-0.5 text-sm">Predictive Qualification</h3>
              </div>
            </div>
            <div className="p-3 bg-card rounded-b-xl flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Uses AI Copilot to score lead intent.
            </div>
          </div>

          {/* Split Path Wrapper */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-amber-500/40" />
            {/* Horizontal Split Line */}
            <div className="w-[420px] h-0.5 bg-border relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                Score &gt; 80
              </div>
            </div>
            <div className="flex w-[420px] justify-between">
              
              {/* Left Branch */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-border" />
                <div className="w-2 h-2 -mt-1 border-b-2 border-r-2 border-border rotate-45 bg-slate-50" />
                
                <div className="w-[280px] bg-card border border-border rounded-xl shadow-md hover:border-purple-500/50 transition-colors cursor-pointer mt-4">
                  <div className="p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Send WhatsApp</span>
                      <h3 className="font-bold text-foreground mt-0.5 text-sm">High Value Intro</h3>
                      <p className="text-xs text-muted-foreground mt-1">Send personalized calendar link.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Branch */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-border" />
                <div className="w-2 h-2 -mt-1 border-b-2 border-r-2 border-border rotate-45 bg-slate-50" />
                
                <div className="w-[280px] bg-card border border-border rounded-xl shadow-md hover:border-blue-500/50 transition-colors cursor-pointer mt-4 opacity-70">
                  <div className="p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Delay & Email</span>
                      <h3 className="font-bold text-foreground mt-0.5 text-sm">Standard Nurture</h3>
                      <p className="text-xs text-muted-foreground mt-1">Wait 2 days then send sequence.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Add button */}
          <div className="mt-10">
            <button className="flex flex-col items-center gap-2 group outline-none">
              <div className="w-12 h-12 bg-card border-2 border-dashed border-primary/50 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/5 group-hover:border-primary group-hover:scale-110 transition-all shadow-sm">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Add Step</span>
            </button>
          </div>

        </div>

        {/* Sidebar Configuration Panel */}
        <div className="w-80 bg-card border-l border-border shadow-2xl z-20 hidden lg:flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Node Settings</h3>
          </div>
          <div className="p-6 flex-1 overflow-auto space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Step Name</label>
              <input type="text" defaultValue="New CRM Lead" className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide">Trigger Conditions</label>
              <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-foreground">Pipeline Stage</span>
                  <select className="px-2 py-1.5 border border-input rounded-md text-sm bg-background">
                    <option>Contact Made</option>
                    <option>Proposal Set</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-foreground">Lead Source</span>
                  <select className="px-2 py-1.5 border border-input rounded-md text-sm bg-background">
                    <option>Any Source</option>
                    <option>Organic Search</option>
                  </select>
                </div>
                <button className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
                  <Plus className="w-3 h-3" /> Add Condition
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
