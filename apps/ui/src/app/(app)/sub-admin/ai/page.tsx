'use client';

import { useState, useEffect } from 'react';
import { subAdminAiService } from '@/services/sub-admin-ai.service';

const AI_MODELS = [
  { id: 'gpt-4o', name: 'OpenAI GPT-4o', type: 'LLM' },
  { id: 'claude-3-5-sonnet', name: 'Anthropic Claude 3.5', type: 'LLM' },
  { id: 'llama-3-70b', name: 'Llama 3 70B (Local)', type: 'LLM' },
];

export default function SubAdminAiPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await subAdminAiService.getConfigs();
      setConfigs(response.data || []);
    } catch (error) {
       console.error('Failed to load AI configs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: any) => {
    try {
      await subAdminAiService.updateConfig({ key, value });
      loadConfigs();
      alert('AI manifold recalibrated.');
    } catch (error) {
       console.error('Update failed', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-10 uppercase tracking-widest text-gray-900">SubAdmin / Intelligence Manifold</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[120rem]">
         <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10">Neural Vector Core</h2>
            <div className="space-y-6">
               {AI_MODELS.map(model => (
                  <button 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full p-8 rounded-[2.5rem] text-left border-2 transition-all flex justify-between items-center group ${selectedModel === model.id ? 'border-black bg-black text-white shadow-2xl' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                  >
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Engine Type: {model.type}</div>
                        <div className="text-xs font-black uppercase tracking-widest">{model.name}</div>
                     </div>
                     <div className={`w-4 h-4 rounded-full border-4 ${selectedModel === model.id ? 'border-white bg-transparent' : 'border-gray-200 bg-white group-hover:border-gray-400'}`}></div>
                  </button>
               ))}
            </div>
            <div className="mt-12 p-8 bg-blue-50/50 rounded-3xl border border-blue-100/50">
               <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Operational Insight</div>
               <p className="text-[10px] text-blue-500 font-bold leading-relaxed uppercase tracking-widest">
                  Deploying high-magnitude engines increases resource consumption. Monitor usage telemetry closely.
               </p>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
               <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10">Inference Parameters</h2>
               <div className="space-y-10">
                  <div>
                     <div className="flex justify-between items-center mb-4 px-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Temperature (Entropy)</label>
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">0.7</span>
                     </div>
                     <input type="range" className="w-full accent-black h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-4 px-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Tokens (Magnitude)</label>
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">2048</span>
                     </div>
                     <input type="range" className="w-full accent-black h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="pt-8 flex justify-end">
                     <button className="bg-black text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10">
                        Calibrate Manifold
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
               <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 text-red-500">Security Guardrails</h2>
               <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PII Filtering Vector</div>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative shadow-inner">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
