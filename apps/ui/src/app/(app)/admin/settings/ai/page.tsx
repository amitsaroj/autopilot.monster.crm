'use client';

import { useState, useEffect } from 'react';
import { adminAiSettingsService } from '@/services/admin-ai-settings.service';

export default function AdminAISettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminAiSettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load AI settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAiSettingsService.updateSettings(settings);
      alert('Global AI parameters updated.');
    } catch (error) {
      console.error('Failed to update AI settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Platform Intelligence Layer</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'SYNCING INTELLIGENCE...' : 'COMMIT AI CONFIG'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Initializing neural pathways...</div>
      ) : (
        <div className="space-y-10 max-w-6xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10">LLM Provider Manifest</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">OpenAI API Key</label>
                    <input 
                      type="password"
                      value={settings.openaiKey}
                      onChange={e => setSettings({...settings, openaiKey: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-purple-500 transition-all outline-none"
                      placeholder="sk-••••••••"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Anthropic API Key</label>
                    <input 
                      type="password"
                      value={settings.anthropicKey}
                      onChange={e => setSettings({...settings, anthropicKey: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-purple-500 transition-all outline-none"
                      placeholder="sk-ant-••••••••"
                    />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
                 <h2 className="text-xl font-black text-gray-900 mb-8">Model Arbitration</h2>
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Default Inference Model</label>
                       <select 
                         value={settings.defaultModel}
                         onChange={e => setSettings({...settings, defaultModel: e.target.value})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-purple-500 transition-all outline-none appearance-none"
                       >
                          <option value="gpt-4o">GPT-4o (OpenAI)</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                          <option value="claude-3-opus">Claude 3 Opus</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vector Embedding Engine</label>
                       <input 
                         value={settings.embeddingModel}
                         onChange={e => setSettings({...settings, embeddingModel: e.target.value})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-purple-500 transition-all outline-none"
                       />
                    </div>
                 </div>
              </div>

              <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white flex flex-col relative overflow-hidden group">
                 <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -mb-24 -mr-24 group-hover:bg-purple-500/20 transition-all"></div>
                 <h2 className="text-xl font-black mb-6">Platform Autonomous Identity</h2>
                 <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Global System Prompt</label>
                 <textarea 
                   value={settings.platformRole}
                   onChange={e => setSettings({...settings, platformRole: e.target.value})}
                   className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-medium focus:border-purple-500 transition-all outline-none resize-none"
                   rows={5}
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
