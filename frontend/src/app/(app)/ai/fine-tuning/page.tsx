"use client";

import { useState } from 'react';
import { Sparkles, Play, Award, RefreshCw, BarChart2, Plus, Database, Cpu, Settings, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FineTuneJob {
  id: string;
  model: string;
  datasetName: string;
  epochs: number;
  status: 'PENDING' | 'TRAINING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  loss?: number;
}

export default function AIFineTuningPage() {
  const [jobs, setJobs] = useState<FineTuneJob[]>([
    { id: 'ft-001', model: 'gpt-4o-mini', datasetName: 'customer_support_q2_chats.jsonl', epochs: 3, status: 'COMPLETED', startedAt: new Date(Date.now() - 86400000 * 3).toLocaleString(), loss: 0.182 },
    { id: 'ft-002', model: 'gpt-4o-mini', datasetName: 'sales_closer_objections.jsonl', epochs: 4, status: 'COMPLETED', startedAt: new Date(Date.now() - 86400000 * 2).toLocaleString(), loss: 0.124 },
  ]);

  const [runningJob, setRunningJob] = useState(false);
  
  // Custom Fine Tuning form
  const [baseModel, setBaseModel] = useState('gpt-4o-mini');
  const [epochs, setEpochs] = useState(3);
  const [dataset, setDataset] = useState('objections_conversations.jsonl');

  const handleCreateJob = () => {
    const jobId = `ft-${Date.now().toString().slice(-4)}`;
    const newJob: FineTuneJob = {
      id: jobId,
      model: baseModel,
      datasetName: dataset,
      epochs: epochs,
      status: 'TRAINING',
      startedAt: new Date().toLocaleString(),
    };
    
    setJobs([newJob, ...jobs]);
    setRunningJob(true);
    toast.success('Fine-tuning cluster initialized. Job queued.');

    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'COMPLETED', loss: 0.145 } : j));
      setRunningJob(false);
      toast.success(`Fine-tuning job ${jobId} finished! Custom model adapter compiled.`);
    }, 8000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.05] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Console</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Fine-Tuning Portal</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Train customized adapters on top of foundation models using custom CRM datasets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Create Job Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-sm">Configure Model Adapter</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Configure hyper-parameters & inputs</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Base Foundation Model</label>
                <select
                  value={baseModel}
                  onChange={(e) => setBaseModel(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                  <option value="gpt-4o">GPT-4o (High Performance)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Training Dataset (.jsonl)</label>
                <select
                  value={dataset}
                  onChange={(e) => setDataset(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold"
                >
                  <option value="objections_conversations.jsonl">objections_conversations.jsonl (248 lines)</option>
                  <option value="lead_follow_up_intake.jsonl">lead_follow_up_intake.jsonl (102 lines)</option>
                  <option value="support_frequently_asked.jsonl">support_frequently_asked.jsonl (850 lines)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Epochs Count</label>
                <input 
                  type="number" 
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                  min={1}
                  max={10}
                />
              </div>
            </div>

            <button
              onClick={handleCreateJob}
              disabled={runningJob}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" /> Initialize Training
            </button>
          </div>
        </div>

        {/* Right Column: Training Logs / Jobs history */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-sm">Fine-Tuning History</h3>
            
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 border border-white/[0.05] bg-white/[0.01] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold text-white font-mono">{job.id}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        job.status === 'TRAINING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[10px] text-gray-500">
                      <span>Model: <span className="text-white font-bold">{job.model}</span></span>
                      <span>Dataset: <span className="text-white font-bold font-mono">{job.datasetName}</span></span>
                      <span>Epochs: <span className="text-white font-bold">{job.epochs}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {job.loss !== undefined && (
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Final Loss</p>
                        <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{job.loss}</p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">{job.startedAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
